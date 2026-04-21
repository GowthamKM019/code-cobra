import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [level, setLevel] = useState("easy");
  const [highScore, setHighScore] = useState(0);

  const user = localStorage.getItem("user");
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/loading", { state: { level } });
  };

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch("https://backend-xo3u.onrender.com/api/get-score/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user,
          }),
        });

        const data = await res.json();
        console.log("Dashboard Score:", data);

        if (data.high_score !== undefined) {
          setHighScore(data.high_score);
        }
      } catch (err) {
        console.error("Error fetching score:", err);
      }
    };

    fetchScore();
  }, [user]);

  return (
    <div className="dashboard">

      {/* Profile */}
      <div className="profile">
        <div className="avatar"></div>
        <p>{user}</p>
      </div>

      {/* Center */}
      <div className="center-container">
        <div className="card">
          <h1>Let’s Play</h1>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button className="start-btn" onClick={handleStart}>
          Start Game
        </button>
      </div>

      {/* High Score */}
      <div className="highscore">
        <h3>High Score</h3>
        <div className="score">{highScore}</div>
      </div>

    </div>
  );
};

export default Dashboard;