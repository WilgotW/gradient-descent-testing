import React, { useRef, useState, useEffect } from "react";

interface PointProps {
  x: number;
  y: number;
}

interface LinearEquationProps {
  slope: number;
  intercept: number;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [c, setC] = useState<CanvasRenderingContext2D | null>();

  const [points, setPoints] = useState<PointProps[]>();

  const [linearEquation, setLinearEquation] = useState<LinearEquationProps>();

  const [sumR2Intercept, setSumR2Intercept] = useState<number>();
  const [sumR2Slope, setSumR2Slope] = useState<number>();

  const [startDescent, setStartDescent] = useState<boolean>(false);
  const [iterations, setIterations] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) setC(context);

    //set starting props: m(intercept) k(slope)
    const equation: LinearEquationProps = { intercept: 10, slope: 0.5 };
    setLinearEquation(equation);
    calcLossFunction();
  }, []);

  useEffect(() => {
    if (points?.length && linearEquation) {
      start();
      console.log(points);
    }
  }, [points]);
  useEffect(() => {
    if (!linearEquation) return;
    resetCanvas();
    drawPoints();
    drawEquation();

    if (startDescent) {
      setIterations((prev) => prev + 1);
      setTimeout(() => {
        calcLossFunction();
      }, 500);
    }
  }, [linearEquation]);

  useEffect(() => {
    if (iterations >= 50) {
      setStartDescent(false);
    }
  }, [iterations]);

  function start() {
    if (canvasRef && c) {
      resetCanvas();
      drawPoints();
      drawEquation();
    }
  }

  function startGradientDescent() {
    calcLossFunction();
    setStartDescent(true);
  }

  function generatePoints() {
    resetCanvas();
    setPoints([]);
    if (c) {
      const p: PointProps[] = [];
      for (let i = 0; i < 10; i++) {
        const newPoint: PointProps = {
          x: 100 + i * 50 + randomInt(0, 30),
          y: 50 + randomInt(0, 400) + i * 30,
        };
        p.push(newPoint);
      }
      setPoints(p);
    }
  }
  //math functions
  function calcLossFunction() {
    if (!linearEquation || !points?.length) return;

    //calc R^2 for every point
    //R^2 = (y - predicted y) = (y - (intercept + slope * x)) = (y - (m + kx))
    //d/di = D(Pi1) + ... + D(Pin)
    //d/ds = D(Ps1) + ... + D(Psn)
    //step size(intercept) = d/di * learning rate(0.01)
    //step size(slope) = d/ds * learning rate(0.01)
    //new intercept = prev intercept - step size(intercept)
    //new slope = prev slope - step size(slope)

    //derivate Loss Function:
    //R^2 = d/di ((point y) - (equation intercept + equation slope * (point x)))^2
    //chain rule, derivate for i(intercept) --> -i

    const learningRate = 0.0001;
    let gxi = -1 * linearEquation!.intercept;

    let diRes = 0;
    let dsRes = 0;

    points!.forEach((point) => {
      const pY = point.y;
      const pX = point.x;
      const derivateIntercept =
        gxi * 2 * pY -
        gxi * 2 * linearEquation!.intercept -
        gxi * 2 * linearEquation!.slope * pX;

      diRes += derivateIntercept;
      const derivateSlope =
        -2 * pX * pY +
        2 * pX * linearEquation!.intercept +
        2 * pX * pX * linearEquation!.slope;
      dsRes += derivateSlope;
      console.log("d slope: " + derivateSlope);
    });
    console.log("ds res: " + dsRes + " di res: " + diRes);

    const stepSizeIntercept = diRes * learningRate;
    const newIntercept = linearEquation!.intercept - stepSizeIntercept;

    const stepSizeSlope = dsRes * learningRate;
    const newSlope = linearEquation!.slope - stepSizeSlope * 0.002;

    setLinearEquation({
      intercept: newIntercept,
      slope: newSlope,
    });
    setSumR2Intercept(diRes);
    setSumR2Slope(dsRes);
  }

  //draw functions
  function resetCanvas() {
    if (canvasRef && c) {
      c.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      c.fillStyle = "#F5F5F5";
      c.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  }
  function drawPoints() {
    if (canvasRef && c) {
      points?.forEach((point) => {
        c.fillStyle = "limegreen";
        c.beginPath();
        c.arc(point.x, canvasRef.current!.height - point.y, 10, 0, Math.PI * 2);
        c.fill();
      });
      c.closePath();
    }
  }
  function drawEquation() {
    if (canvasRef && c) {
      c.beginPath();
      c.lineWidth = 3;
      c.strokeStyle = "red";
      c.moveTo(0, canvasRef.current!.height - linearEquation!.intercept);

      let interY = linearEquation!.intercept;
      let interX = 0;
      while (
        interY < canvasRef.current!.height &&
        interX < canvasRef.current!.width
      ) {
        if (linearEquation!.slope <= 0) {
          interX = canvasRef.current!.width;
          return;
        }
        interY += linearEquation!.slope;
        interX += 1;
      }
      c.lineTo(interX, 0);
      c.stroke();
      c.closePath();
    }
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + 1) - min;
  }
  return (
    <div style={{ display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <canvas width={1000} height={700} ref={canvasRef}></canvas>
        </div>
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "50px",
            alignItems: "center",
          }}
        >
          <button onClick={() => generatePoints()}>Generate points</button>
          <button onClick={() => startGradientDescent()}>
            Begin Gradient Descent
          </button>
          <div className="eq-container">
            {linearEquation && (
              <span>
                Linear equation: y = {linearEquation!.slope}k +{" "}
                {linearEquation!.intercept}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10pxs",
          margin: "10px",
        }}
      >
        <div
          style={{
            background: "rgb(224, 224, 224)",
            width: "500px",
            borderBottom: "solid 1px black",
            padding: "10px",
          }}
        >
          <span>
            Sum R^2 average intercept:{" "}
            {sumR2Intercept &&
              points?.length &&
              (sumR2Intercept * -1) / points.length}{" "}
          </span>
        </div>
        <div
          style={{
            background: "rgb(224, 224, 224)",
            width: "500px",
            borderBottom: "solid 1px black",
            padding: "10px",
          }}
        >
          <span>
            Sum R^2 average slope:{" "}
            {sumR2Slope && points?.length && sumR2Slope / points.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {points?.map((point, index) => (
            <div
              style={{
                width: "500px",
                padding: "10px",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                background: "rgb(241, 241, 241)",
                borderBottom: "solid 1px black",
              }}
            >
              <div>point {index}</div>
              <div>x: {point.x}</div>
              <div>y: {point.y}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
