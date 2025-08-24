import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) return setError("Passwords must match");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setMessage("Registration successful! Check your email.");
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleRegister}>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirm Password</label>
        <input
          type="password"
          className="form-control"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
