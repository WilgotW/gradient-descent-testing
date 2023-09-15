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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) setC(context);

    //set starting props: m(intercept) k(slope)
    const equation: LinearEquationProps = { intercept: 0, slope: 1 };
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
      draw();
    }
  }, [points, linearEquation]);

  function draw() {
    if (canvasRef && c) {
      console.log(linearEquation);

      c.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      c.fillStyle = "#F5F5F5";
      c.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      points?.forEach((point) => {
        c.fillStyle = "limegreen";
        c.beginPath();
        c.arc(point.x, canvasRef.current!.height - point.y, 10, 0, Math.PI * 2);
        c.fill();
      });
      c.closePath();

      // c.beginPath();
      // c.moveTo(0, 0);
      // c.lineTo(100, 500);
      // c.stroke();

      c.beginPath();
      c.lineWidth = 3;
      c.strokeStyle = "red";
      c.moveTo(0, canvasRef.current!.height - linearEquation!.intercept);
      const rightIntercept =
        (canvasRef.current!.width * linearEquation!.slope) / 2;
      console.log(rightIntercept);
      c.lineTo(canvasRef.current!.width, rightIntercept);
      c.stroke();
      c.closePath();
    }
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + 1) - min;
  }
  return <canvas width={1000} height={700} ref={canvasRef}></canvas>;
}
