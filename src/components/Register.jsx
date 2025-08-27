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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setMessage(`Registration successful! User ID: ${data.user.id}`);
        onSuccess();
      } else {
        setError("Registration returned success but no user created");
      }
    } catch (err) {
      setLoading(false);
      setError("Unexpected error occurred. Please try again.");
      console.error(err);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "4rem" }}>
      <div className="card shadow-lg rounded-3 p-4">
        <h2 className="text-center mb-4" style={{ fontWeight: "700" }}>
          Register
        </h2>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
        {message && (
          <div className="alert alert-success" role="alert" style={{ fontSize: "0.9rem" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Email address
            </label>
            <input
              id="emailInput"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">
              Password
            </label>
            <input
              id="passwordInput"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmInput" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmInput"
              type="password"
              className="form-control"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ fontWeight: "600" }}
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
