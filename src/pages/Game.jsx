import React, { useEffect, useRef, useState } from "react";
import "../styles/Game.css";
import { useLocation, useNavigate } from "react-router-dom";

const Game = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const level = location.state?.level || "easy";

  const speedMap = { easy: 200, medium: 120, hard: 70 };
  const grid = 20;
  const MAX = 25;

  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [direction, setDirection] = useState("RIGHT");
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [fruitCount, setFruitCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [highScore, setHighScore] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const fruitRef = useRef(fruitCount);
  const pausedRef = useRef(isPaused);
  const gameOverRef = useRef(isGameOver);
  const showInfoRef = useRef(showInfo);

  useEffect(() => { showInfoRef.current = showInfo }, [showInfo]);
  useEffect(() => { snakeRef.current = snake }, [snake]);
  useEffect(() => { directionRef.current = direction }, [direction]);
  useEffect(() => { foodRef.current = food }, [food]);
  useEffect(() => { fruitRef.current = fruitCount }, [fruitCount]);
  useEffect(() => { pausedRef.current = isPaused }, [isPaused]);
  useEffect(() => { gameOverRef.current = isGameOver }, [isGameOver]);

  // ✅ FETCH HIGH SCORE
  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/get-score/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: localStorage.getItem("user") }),
        });
        const data = await res.json();
        if (data.high_score !== undefined) setHighScore(data.high_score);
      } catch (err) {
        console.error(err);
      }
    };
    fetchScore();
  }, []);

  const generateFood = () => ({
    x: Math.floor(Math.random() * MAX),
    y: Math.floor(Math.random() * MAX),
  });

  const changeDirection = (newDir) => {
    setDirection((prev) => {
      if (newDir === "UP" && prev !== "DOWN") return "UP";
      if (newDir === "DOWN" && prev !== "UP") return "DOWN";
      if (newDir === "LEFT" && prev !== "RIGHT") return "LEFT";
      if (newDir === "RIGHT" && prev !== "LEFT") return "RIGHT";
      return prev;
    });
  };

  // 🎮 KEYBOARD
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") changeDirection("UP");
      if (e.key === "ArrowDown") changeDirection("DOWN");
      if (e.key === "ArrowLeft") changeDirection("LEFT");
      if (e.key === "ArrowRight") changeDirection("RIGHT");
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ⏱ TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current || gameOverRef.current || showInfoRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) { setIsGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 💾 SAVE SCORE
  useEffect(() => {
    if (isGameOver) saveScore();
  }, [isGameOver]);

  const saveScore = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/update-score/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: localStorage.getItem("user"), score: fruitCount }),
      });
      const data = await res.json();
      if (data.high_score !== undefined) setHighScore(data.high_score);
    } catch (err) {
      console.log(err);
    }
  };

  // 🎨 DRAW
  const draw = (snake, food) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 500, 500);
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#3b82f6" : "#22c55e";
      ctx.fillRect(s.x * grid, s.y * grid, grid - 2, grid - 2);
    });
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * grid, food.y * grid, grid - 2, grid - 2);
  };

  // 🧠 GAME LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current || gameOverRef.current || showInfoRef.current) return;

      const prev = snakeRef.current;
      const dir = directionRef.current;
      let head = { ...prev[0] };

      if (dir === "RIGHT") head.x++;
      if (dir === "LEFT") head.x--;
      if (dir === "UP") head.y--;
      if (dir === "DOWN") head.y++;

      if (head.x >= MAX) head.x = 0;
      if (head.x < 0) head.x = MAX - 1;
      if (head.y >= MAX) head.y = 0;
      if (head.y < 0) head.y = MAX - 1;

      for (let i = 1; i < prev.length; i++) {
        if (head.x === prev[i].x && head.y === prev[i].y) {
          setIsGameOver(true);
          return;
        }
      }

      let newSnake = [head, ...prev];

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setFruitCount((c) => c + 1);
        setFood(generateFood());
        setTimeLeft(20);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      draw(newSnake, foodRef.current);
    }, speedMap[level]);

    return () => clearInterval(interval);
  }, [level]);

  const restartGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setDirection("RIGHT");
    setFruitCount(0);
    setTimeLeft(20);
    setIsGameOver(false);
  };

  return (
    <div className="game-page">

      {/* TOP BAR */}
      <div className="top-bar">

        {/* LEFT: High Score */}
        <div className="high-score">
          <p>High Score</p>
          <div className="circle">{highScore}</div>
        </div>

        {/* CENTER: Pause */}
        <div className="pause-btn">
          <button onClick={() => setIsPaused(p => !p)}>
            {isPaused ? "▶" : "⏸"}
          </button>
        </div>

        {/* RIGHT: Profile + Logout */}
        <div className="profile">
  <div className="avatar"></div>

  {/* USER NAME BELOW AVATAR */}
  <p className="profile-name">
  {localStorage.getItem("user")}
</p>

  {/* LOGOUT BUTTON BELOW NAME */}
  <button
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("user");
    console.log("Logout clicked"); // debug
    navigate("/login", { replace: true });
  }}
>
  Log Out
</button>
</div>

      </div>

      {/* GAME AREA */}
      <div className="game-area">
        <canvas ref={canvasRef} width={500} height={500}></canvas>
      </div>

      {/* GAME OVER */}
      {isGameOver && (
        <div className="gameover-overlay">
          <div className="gameover-card">
            <h2>Game Over</h2>
            <p>Score: {fruitCount}</p>
            <button onClick={restartGame}>Play Again</button>
            <button className="home-btn" onClick={() => navigate("/dashboard")}>Home</button>
          </div>
        </div>
      )}

      {/* PAUSE */}
      {isPaused && !isGameOver && (
        <div className="pause-overlay">
          <div className="pause-card">
            <h2>Game Paused</h2>
            <button className="resume-btn" onClick={() => setIsPaused(false)}>Resume</button>
            <button className="home-btn" onClick={() => navigate("/dashboard")}>Home</button>
          </div>
        </div>
      )}

      {/* TIMER - right middle */}
      <div className="timer-right">
        <p>Time Left: {timeLeft}s</p>
      </div>

      {/* FRUITS - bottom right */}
      <div className="fruits-bottom-right">
        <p>Fruits</p>
        <div className="circle">{fruitCount}</div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bottom-bar">
        <div className="info-btn">
          <button onClick={() => setShowInfo(s => !s)}>i</button>
        </div>
        <div className="controls">
          <button onClick={() => changeDirection("UP")}>↑</button>
          <div>
            <button onClick={() => changeDirection("LEFT")}>←</button>
            <button onClick={() => changeDirection("RIGHT")}>→</button>
          </div>
          <button onClick={() => changeDirection("DOWN")}>↓</button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInfo && (
        <div className="info-overlay">
          <div className="info-card">
            <h2>How to Play</h2>
            <ul>
              <li>🕹️ Use arrow keys or buttons to move</li>
              <li>🍎 Eat food to grow and earn points</li>
              <li>⏱️ Eat before the timer runs out</li>
              <li>💀 Don't hit yourself</li>
              <li>⏸️ Press Space to pause</li>
            </ul>
            <button onClick={() => setShowInfo(false)}>Got it!</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Game;
