import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Login response:", { data, error: signInError });

      if (signInError) {
        setError(signInError.message);
      } else if (data?.user) {
        onSuccess?.(data.user); // callback with user object
      }
    } catch (err) {
      setError("Unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "4rem" }}>
      <div className="card shadow-lg rounded-3 p-4">
        <h2 className="text-center mb-4" style={{ fontWeight: "700" }}>
          Sign In
        </h2>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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

          <div className="mb-4">
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

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ fontWeight: "600" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
