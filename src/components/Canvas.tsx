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

  const [r2, setR2] = useState<number>(0);
  const [pValue, setPValue] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) setC(context);

    //set starting props: m(intercept) k(slope)
    const equation: LinearEquationProps = { intercept: 10, slope: 2 };
    setLinearEquation(equation);
    calcLossFunction();
  }, []);

  useEffect(() => {
    if (points?.length && linearEquation) {
      start();
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
    } else {
      calcRelationship();
    }
  }, [linearEquation]);

  useEffect(() => {
    if (iterations >= 25) {
      setStartDescent(false);
      setIterations(0);
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

      const steep: number = randomInt(25, 35);
      for (let i = 0; i < 12; i++) {
        const newPoint: PointProps = {
          x: 100 + i * 50 + randomInt(0, 50),
          y: 10 + randomInt(0, 350) + i * steep,
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
    const gxi = -1 * linearEquation!.intercept;

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
    });

    const stepSizeIntercept = diRes * learningRate;
    const newIntercept = linearEquation!.intercept - stepSizeIntercept * 1.2;

    const stepSizeSlope = dsRes * learningRate;
    const newSlope = linearEquation!.slope - stepSizeSlope * 0.002;

    setLinearEquation({
      intercept: newIntercept,
      slope: newSlope,
    });
    setSumR2Intercept(diRes);
    setSumR2Slope(dsRes);
  }

  function calcRelationship() {
    if (!points?.length || !linearEquation) return;
    //calc the relationship between x and y in data points

    //R^2 = (var(mean)-var(fit))/var(mean)

    let meanY = 0;
    points?.forEach((point) => {
      meanY += point.y;
    });
    meanY = meanY / points!.length;
    //var(mean) = ss(mean) / n
    //ss(mean) = (data - mean)^2 /n
    let ssMean = 0;
    points?.forEach((point) => {
      let distance = point.y - meanY;
      distance = distance * distance;
      distance = Math.sqrt(distance);
      ssMean += distance;
    });
    ssMean = ssMean * ssMean;
    const variationMean = ssMean / points.length;

    //var(fit): variation around equation. explained by x
    //var(fit) = ss(fit)/n
    //ss(fit) = (data-line)^2

    let ssFit = 0;
    points?.forEach((point) => {
      const eqYvalue =
        linearEquation!.slope * point.x + linearEquation!.intercept;

      ssFit += point.y - eqYvalue;
    });
    ssFit = ssFit * ssFit;
    const variationFit = ssFit / points.length;

    const R2 = (variationMean - variationFit) / variationMean;
    setR2(R2 * 100);

    //calc p-value
    const pFit = 2; //2 parameters in this program (x, y)
    const pMean = 1; //1 parameter in mean function (y = m)
    const top = (ssMean - ssFit) / (pFit - pMean);
    const bottom = ssFit / points.length - pFit;
    const pValue = top / bottom;
    setPValue(pValue);
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
      c.lineTo(interX, canvasRef.current!.height - interY);
      c.stroke();
      c.closePath();
    }
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + 1) + min;
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
                Linear equation: y = {linearEquation!.slope}x +{" "}
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "30px",
            gap: "10px",
          }}
        >
          <div
            style={{
              height: "20px",
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              padding: "10px",
              background: "rgb(241, 241, 241)",
              borderBottom: "solid 1px black",
              borderRadius: "10px",
            }}
          >
            x explaines y to a certainty: {Math.floor(r2)}%
          </div>
          <div
            style={{
              height: "20px",
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              padding: "10px",
              background: "rgb(241, 241, 241)",
              borderBottom: "solid 1px black",
              borderRadius: "10px",
            }}
          >
            p-value: {Math.round(pValue)} (large value: fit is good)
          </div>
        </div>
      </div>
    </div>
  );
}
