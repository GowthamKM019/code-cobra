import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Loading.css";

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/game"); // 👉 next page
    }, 3000); // 3 seconds (change to 5000 if needed)

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Your snake is getting ready...</p>
    </div>
  );
};

export default Loading;