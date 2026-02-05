import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email address.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!token || !newPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/auth/reset-password", { token, password: newPassword });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {step === 1 && (
          <form onSubmit={handleSendEmail}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 mb-4 border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-hover">Send Reset Link</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter reset token"
              className="w-full p-2 mb-4 border rounded"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full p-2 mb-4 border rounded"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-hover">Reset Password</button>
          </form>
        )}
        {step === 3 && (
          <div className="text-green-600">{message}</div>
        )}
        <div className="mt-4 text-sm text-center">
          <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
