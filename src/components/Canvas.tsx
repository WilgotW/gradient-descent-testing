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
  const [rValues, setRValues] = useState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) setC(context);

    //set starting props: m(intercept) k(slope)
    const equation: LinearEquationProps = { intercept: 10, slope: 1 };
    setLinearEquation(equation);
    console.log(linearEquation);
  }, []);

  useEffect(() => {
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
  }, [c]);
  useEffect(() => {
    if (points?.length && linearEquation) {
      start();
    }
  }, [points, linearEquation]);

  function start() {
    if (canvasRef && c) {
      resetCanvas();
      drawPoints();
      drawEquation();
    }
  }

  //math functions
  function calcLossFunction() {
    if (!linearEquation || !points) return;

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

    const learningRate = 0.000001; // Adjust the learning rate

    let gxi = -1 * linearEquation!.intercept;
    let diRes = 0;

    let dsRes = 0;

    points!.forEach((point) => {
      const pY = canvasRef.current!.height - point.y;
      diRes +=
        gxi * 2 * pY -
        gxi * 2 * linearEquation!.intercept -
        gxi * 2 * linearEquation!.slope * point.x;
      dsRes +=
        2 *
        point.x *
        -1 *
        (pY - (linearEquation!.intercept + linearEquation!.slope * point.x));
    });
    console.log("ds res: " + dsRes + " di res: " + diRes);

    const stepSizeIntercept = diRes * learningRate;
    const newIntercept = linearEquation!.intercept - stepSizeIntercept;

    console.log(stepSizeIntercept);

    const stepSizeSlope = dsRes * learningRate;
    const newSlope = linearEquation!.slope - stepSizeSlope;

    setLinearEquation({
      intercept: newIntercept,
      slope: newSlope,
    });
    resetCanvas();
    drawPoints();
    drawEquation();
  }

  useEffect(() => {
    if (!linearEquation) return;
    console.log(linearEquation);
    resetCanvas();
    drawPoints();
    drawEquation();
  }, [linearEquation]);

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

      let interY = 0;
      let interX = 0;
      while (
        interY < canvasRef.current!.height ||
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
    <>
      <canvas width={1000} height={700} ref={canvasRef}></canvas>
      <button onClick={() => calcLossFunction()}>new</button>
    </>
  );
}
