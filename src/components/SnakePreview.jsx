import React, { useEffect, useRef } from "react";

const SnakePreview = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const grid = 20;
    const cols = canvas.width / grid;
    const rows = canvas.height / grid;

    let snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ];

    let direction = "RIGHT";

    const directions = {
      RIGHT: { x: 1, y: 0 },
      LEFT: { x: -1, y: 0 },
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 }
    };

    // Smooth path movement logic
    const moveSnake = () => {
      const head = snake[0];
      const newHead = {
        x: head.x + directions[direction].x,
        y: head.y + directions[direction].y
      };

      // Wrap around edges (smooth feel)
      if (newHead.x >= cols) newHead.x = 0;
      if (newHead.x < 0) newHead.x = cols - 1;
      if (newHead.y >= rows) newHead.y = 0;
      if (newHead.y < 0) newHead.y = rows - 1;

      snake.unshift(newHead);
      snake.pop();
    };

    // Smart turning (not random chaos)
    const changeDirection = () => {
      const possible = ["RIGHT", "DOWN", "LEFT", "UP"];

      if (Math.random() < 0.2) {
        const newDir = possible[Math.floor(Math.random() * 4)];

        // Prevent reverse
        if (
          (direction === "RIGHT" && newDir !== "LEFT") ||
          (direction === "LEFT" && newDir !== "RIGHT") ||
          (direction === "UP" && newDir !== "DOWN") ||
          (direction === "DOWN" && newDir !== "UP")
        ) {
          direction = newDir;
        }
      }
    };

    const draw = () => {
      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Snake body
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#4ade80" : "#22c55e";

        ctx.beginPath();
        ctx.roundRect(
          segment.x * grid,
          segment.y * grid,
          grid - 2,
          grid - 2,
          6
        );
        ctx.fill();
      });
    };

    const gameLoop = setInterval(() => {
      changeDirection();
      moveSnake();
      draw();
    }, 120); // speed

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{
        border: "2px solid #000",
        borderRadius: "10px",
        boxShadow: "0 0 15px #22c55e",
      }}
    />
  );
};

export default SnakePreview;