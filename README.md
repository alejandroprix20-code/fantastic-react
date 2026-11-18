# 🔐 Full-Stack Secure Password Studio: The Ultimate "Build from Scratch" Guide

This comprehensive guide walks you through building a modern **Full-Stack Application** from zero. We will create a reactive React UI, a secure Node.js REST API, and a persistent MySQL database.

---

## 🏗️ 0. The Anatomy of the Workspace

Based on our project structure, here is what every file does:

### 📂 Root Project (Frontend - React + Vite)

- [index.html](index.html): The entry point for the browser. It contains the `<div id="root">` where React injects our app.
- [package.json](package.json): Lists the frontend dependencies (`react`, `vite`) and scripts (`npm run dev`).
- [vite.config.js](vite.config.js): Tells Vite how to bundle our React project.
- [src/main.jsx](src/main.jsx): The JavaScript entry point that connects the React code to the HTML.
- [src/App.jsx](src/App.jsx): The main container for our application.
- [src/index.css](src/index.css): Global styles (resetting margins, setting background colors).
- [src/Components/PasswordGenerator.jsx](src/Components/PasswordGenerator.jsx): The "brain" of the app. Handles logic, randomization, and talks to the server.
- [src/Components/PasswordGenerator.css](src/Components/PasswordGenerator.css): Component-specific styles for the studio layout.

### 📂 Backend Folder (Node.js + Express)

- [backend/server.js](backend/server.js): The heart of our API. It waits for requests from the frontend and communicates with the database.
- [backend/package.json](backend/package.json): Lists backend-specific packages (`express`, `mysql2`, `cors`).
- [backend/.env](backend/.env): **Crucial File.** Stores your private database credentials so they aren't hardcoded.

---

## 🛠️ Phase 1: Environment & Scaffolding

### 1.1 Prerequisites

Ensure you have **Node.js** and **MySQL** installed on your system.

### 1.2 Scaffolding instructions

1.  **Initialize Frontend**:
    ```bash
    npm create vite@latest . -- --template react
    npm install
    ```
2.  **Initialize Backend**:
    ```bash
    mkdir backend && cd backend
    npm init -y
    npm install express mysql2 cors dotenv
    npm install --save-dev nodemon
    ```

---

## 🚀 Phase 2: Building the Frontend

### 2.1 Global Setup (`src/main.jsx` & `src/index.css`)

Configure the root of your application and add the base dark theme styles found in Section 5.1 and 5.2.

### 2.2 The Component (`src/Components/PasswordGenerator.jsx`)

Create the file and implement the logic to:

- Track state for `length`, `numbers`, `symbols`.
- Use `useCallback` for the generation algorithm.
- Use `useEffect` to regenerate when settings change.
- Use `fetch` to POST data to the backend port (5001).

---

## 🌐 Phase 3: Building the Backend

### 3.1 The DB Connection (`backend/server.js`)

Set up an Express server and a MySQL connection pool. A "pool" is better than a single connection because it handles multiple simultaneous requests efficiently.

### 3.2 SQL Table Creation & Data Strategy

The **Database** is the "Permanent Memory" of your project. While React forgets everything when you refresh the page, MySQL keeps your generated passwords safe forever. Run the following code in your MySQL Workbench or terminal to set up your storage:

```sql
-- 
CREATE DATABASE first_proyect_db;

USE first_proyect_db;

CREATE TABLE passwords (
	id INT AUTO_INCREMENT PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  lenght INT NOT NULL,
  include_numbers BOOLEAN NOT NULL,
  include_symbols BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM passwords;

DROP DATABASE IF EXISTS first_proyect_db;

---

## 📂 Phase 4: Full Code Reference (Copy & Paste)

### 4.1 Root - `index.html`
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```
-- 
```

### 4.2 Entrypoint - `src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 4.3 Main Container - `src/App.jsx`

```javascript
import React from "react";
import PasswordGenerator from "./Components/PasswordGenerator";

const App = () => {
  return (
    <>
      <PasswordGenerator />
    </>
  );
};

export default App;
```

### 4.4 Component - `src/Components/PasswordGenerator.jsx`

```javascript
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./PasswordGenerator.css";

const PasswordGenerator = () => {
  const [length, setLength] = useState(15);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const passwordRef = useRef(null);

  const strength =
    length >= 16 && includeNumbers && includeSymbols
      ? "Strong"
      : length >= 10
      ? "Medium"
      : "Weak";

  const generatePassword = useCallback(() => {
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let generatedPassword = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setPassword(generatedPassword);
    setCopied(false);
    setSaved(false);
    setMessage("");
  }, [length, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = () => {
    window.navigator.clipboard.writeText(password);
    passwordRef.current?.select();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePassword = () => {
  fetch("http://localhost:5001/passwords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
      length,
      includeNumbers,
      includeSymbols,
    }),
  })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error saving password");
      }

      return data;
    })
    .then((data) => {
      console.log("Password saved:", data);
      setSaved(true);
      setMessage("Password saved in database!");

      setTimeout(() => {
        setSaved(false);
        setMessage("");
      }, 2500);
    })
    .catch((error) => {
      console.error("Error saving password:", error);
      setMessage(error.message);
    });
};

  return (
    <main className="pg-page">
      <section className="pg-container">
        <div className="pg-header">
          <p className="pg-eyebrow">Secure password studio</p>
          <h1 className="pg-title">Generate strong passwords instantly</h1>
          <p className="pg-subtitle">
            Create, copy, and save high-strength passwords in one clean workspace.
          </p>
        </div>

        <div className="pg-display-container">
          <input
            type="text"
            value={password}
            className="pg-display"
            readOnly
            ref={passwordRef}
          />

          <button
            onClick={copyToClipboard}
            className={`pg-copy-btn ${copied ? "active" : ""}`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className={`pg-strength ${strength.toLowerCase()}`}>
          <span>Strength</span>
          <strong>{strength}</strong>
        </div>

        <div className="pg-controls">
          <div className="pg-control-top">
            <label htmlFor="password-length">Password length</label>
            <span>{length}</span>
          </div>

          <input
            id="password-length"
            type="range"
            min="6"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="pg-slider"
          />

          <div className="pg-options">
            <label className="pg-option">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
              />
              <span>Numbers</span>
            </label>

            <label className="pg-option">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
              />
              <span>Symbols</span>
            </label>
          </div>
        </div>

        <button
          onClick={savePassword}
          className={`pg-save-btn ${saved ? "active" : ""}`}
        >
          {saved ? "Saved" : "Save password"}
        </button>

        {message && <p className="pg-message">{message}</p>}
      </section>
    </main>
  );
};

export default PasswordGenerator;
```

### 4.5 Backend Server - `backend/server.js`

```javascript
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");

    res.json({
      message: "Database connected successfully",
      result: rows[0].result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// GET -> Retrieve all saved passwords
app.get("/passwords", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM passwords");

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// POST -> Save a new password
app.post("/passwords", async (req, res) => {
  try {
    const { password, length, includeNumbers, includeSymbols } = req.body;

    const [result] = await db.query(
      "INSERT INTO passwords (password, length, include_numbers, include_symbols) VALUES (?, ?, ?, ?)",
      [password, length, includeNumbers, includeSymbols]
    );

    res.status(201).json({
      message: "Password saved successfully",
      id: result.insertId,
      password,
      length,
      includeNumbers,
      includeSymbols,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### 4.6 Styling - `src/Components/PasswordGenerator.css`

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 32%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.16), transparent 30%),
    #07111f;
}

.pg-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 18px;
}

.pg-container {
  width: min(100%, 640px);
  padding: 42px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(18px);
}

.pg-header {
  margin-bottom: 30px;
}

.pg-eyebrow {
  margin: 0 0 10px;
  color: #38bdf8;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.pg-title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(32px, 6vw, 48px);
  line-height: 1.05;
}

.pg-subtitle {
  margin: 14px 0 0;
  max-width: 500px;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.6;
}

.pg-display-container {
  display: flex;
  overflow: hidden;
  border-radius: 18px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.pg-display {
  min-width: 0;
  flex: 1;
  padding: 20px;
  border: none;
  outline: none;
  background: transparent;
  color: #34d399;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 22px;
  font-weight: 800;
}

.pg-copy-btn {
  min-width: 112px;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.pg-copy-btn:hover,
.pg-copy-btn.active {
  background: #059669;
}

.pg-strength {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.58);
  color: #cbd5e1;
  font-weight: 700;
}

.pg-strength.strong strong {
  color: #34d399;
}

.pg-strength.medium strong {
  color: #facc15;
}

.pg-strength.weak strong {
  color: #fb7185;
}

.pg-controls {
  margin-top: 28px;
}

.pg-control-top {
  display: flex;
  justify-content: space-between;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 800;
}

.pg-slider {
  width: 100%;
  margin-top: 18px;
  accent-color: #38bdf8;
}

.pg-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 24px;
}

.pg-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.48);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 700;
}

.pg-option input {
  width: 20px;
  height: 20px;
  accent-color: #2563eb;
}

.pg-save-btn {
  width: 100%;
  margin-top: 28px;
  padding: 18px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: white;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.28);
}

.pg-save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 46px rgba(37, 99, 235, 0.36);
}

.pg-save-btn.active {
  background: linear-gradient(135deg, #10b981, #059669);
}

.pg-message {
  margin: 16px 0 0;
  color: #a7f3d0;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
}

@media (max-width: 560px) {
  .pg-container {
    padding: 28px;
    border-radius: 22px;
  }

   .pg-header {
    text-align: center;
  }

  .pg-title {
    font-size: clamp(26px, 8vw, 42px);
  }

  .pg-display-container {
    flex-direction: column;
  }

  .pg-copy-btn {
    min-height: 50px;
  }

  .pg-options {
    grid-template-columns: 1fr;
  }
}
```

### 4.7 Environment - `backend/.env`

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=!!Alejandro@@12
DB_NAME=first_project_db
PORT=5001
```

---

## ⚡ Execution Steps

1.  **Start Backend**: `cd backend && npm run dev`
2.  **Start Frontend**: `npm run dev` (in the root)
3.  **Use**: Generate a password, copy it, and hit "Save to Database" to verify the persistent storage.

**Happy Coding!** You've just built a production-structured full-stack project. 🚀
