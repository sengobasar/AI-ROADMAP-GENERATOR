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
    
    if (password !== confirm) {
      return setError("Passwords must match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    console.log("Attempting to register with:", { email, passwordLength: password.length });
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), // Remove any whitespace
        password 
      });
      
      console.log("Registration response:", { data, error });
      
      setLoading(false);
      
      if (error) {
        console.error("Registration error:", error);
        setError(error.message);
      } else {
        console.log("Registration successful. User data:", data.user);
        
        // Check if user was actually created
        if (data.user) {
          setMessage(`Registration successful! User created with ID: ${data.user.id}`);
          
          // Try to immediately sign in to test
          console.log("Attempting immediate sign in...");
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          
          console.log("Immediate sign in result:", { signInData, signInError });
          
          if (signInError) {
            setMessage(prev => prev + ` However, immediate login failed: ${signInError.message}`);
          } else {
            setMessage(prev => prev + " And immediate login was successful!");
            onSuccess();
          }
        } else {
          setError("Registration appeared successful but no user data returned");
        }
      }
    } catch (err) {
      console.error("Unexpected error during registration:", err);
      setError("An unexpected error occurred");
      setLoading(false);
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
          minLength={6}
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
          minLength={6}
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