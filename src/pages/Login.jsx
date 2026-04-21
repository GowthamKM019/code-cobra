import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SnakePreview from "../components/SnakePreview";
import "../styles/Login.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!username || username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(key)) {
      return "Key must contain letter, number, special character (min 6)";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await fetch("https://backend-xo3u.onrender.com/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, key }),
});

      const data = await res.json();

      if (data.status === "success") {
        setError("");
        localStorage.setItem("user", username);
        navigate("/dashboard");
      } else {
        setError(data.message);
      }

    } catch (err) {
      setError("Server error. Is your Django server running?");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="logo" className="logo" />
        <h1>CODE COBRA</h1>
        <img src={logo} alt="logo" className="logo" />
      </div>

      <SnakePreview />

      <div className="inputs">
        <input
          type="text"
          placeholder="Enter Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <button onClick={handleSubmit}>GO!!</button>
    </div>
  );
};

export default Login;