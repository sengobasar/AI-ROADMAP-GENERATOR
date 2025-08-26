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
    
    console.log("Attempting registration with:", {
      email: email.trim(),
      passwordLength: password.length,
      supabaseUrl: supabase.supabaseUrl,
      supabaseKey: supabase.supabaseKey ? "exists" : "missing"
    });
    
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password 
    });
    
    console.log("Full registration response:", { data, error });
    
    setLoading(false);
    
    if (error) {
      console.error("Registration error:", error);
      setError(error.message);
    } else {
      console.log("Registration data:", data);
      console.log("User created:", data.user);
      console.log("Session:", data.session);
      
      if (data.user) {
        setMessage(`Registration successful! User ID: ${data.user.id}`);
        onSuccess();
      } else {
        setError("Registration returned success but no user created");
      }
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