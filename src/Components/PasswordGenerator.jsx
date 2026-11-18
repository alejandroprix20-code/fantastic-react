import React, { useState, useRef, useCallback, useEffect } from 'react';
import "./PasswordGenerator.css";

const PasswordGenerator = () => {
  const [length, setLength] = useState(15);
  const [password, setPassword] = useState("");
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
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
    setSaved(false);
    setCopied(false);
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
  }

  const savePassword = () => {
    fetch("http://localhost:5001/passwords", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password,
        length,
        includeNumbers,
        includeSymbols,
      })
    })
    .then(async (res) => {
      const data = await res.JSON();

      if (!res.ok) {
        throw new Error(data.message || "Error saving password");
      }

      return data;
    })
     .then((data) => {
      console.log("Password saved:" , data);
      setSaved(true);
      setMessage("Password saved in database");

      setTimeout(() => {
        setSaved(false);
      }, 2500);
     })
     .catch((error) => {
      console.error("Error saving password:" , error);
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
