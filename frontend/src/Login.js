import { useState } from "react";
import { supabase } from "./supabase";
import "./Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const signup = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful. Check your email.");
    }
  };

  const login = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="PashuDrishti login">
        <div className="login-brand-panel">
          <img src="/logo.png" alt="PashuDrishti Logo" className="brand-mark" />
          <p className="eyebrow">Livestock health intelligence</p>
          <h1>PashuDrishti AI</h1>
          <p className="brand-copy">
            Detect, understand, and act on animal health insights from one
            focused workspace.
          </p>

          <div className="insight-strip" aria-label="Product highlights">
            <div>
              <strong>AI</strong>
              <span>Disease support</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Care guidance</span>
            </div>
            <div>
              <strong>Fast</strong>
              <span>Image checks</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="form-heading">
            <span>Welcome back</span>
            <h2>Sign in to continue</h2>
          </div>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-field">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ghost-icon"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Hide password" : "Show password"}
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button
            type="button"
            className="primary-action"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={signup}
            disabled={loading}
          >
            Create account
          </button>
        </div>
      </section>
    </main>
  );
}

export default Login;
