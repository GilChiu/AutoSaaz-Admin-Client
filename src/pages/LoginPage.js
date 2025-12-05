import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!codeSent) return;
    setCodeTimer(30);
    const iv = setInterval(() => {
      setCodeTimer((t) => {
        if (t <= 1) { clearInterval(iv); setCodeSent(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [codeSent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login({ email: credentials.email, password: credentials.password });

    if (result.success) {
      navigate("/dashboard");
    } else {

      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const sendCode = () => {
    if (codeSent) return;
    // Simulate sending 2FA code (disabled for now)

    // setCodeSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top brand bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full grid place-items-center border border-gray-300 text-orange-500 font-semibold">AS</div>
            <div>
              <div className="text-xl font-semibold text-gray-900">AutoSaaz</div>
              <div className="text-xs text-gray-500 -mt-0.5">One Stop Auto Shop</div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered login card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-1 text-sm text-gray-600">Access for Super Admin, Ops Manager, Support Agent</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter Email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">2FA Code (if enabled)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\\d{6}"
                    maxLength={6}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter 6 Digit Code"
                    value={credentials.otp}
                    onChange={(e) => setCredentials({ ...credentials, otp: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={codeSent}
                    className="whitespace-nowrap px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
                  >
                    {codeSent ? `Resend in ${codeTimer}s` : 'Send Code'}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full px-5 py-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
