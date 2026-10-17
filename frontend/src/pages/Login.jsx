import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Headset, LockKeyhole, Mail } from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/useAuth";
import authService from "../services/authService";

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_EMAIL = "admin@ticketflow.demo";
const DEMO_PASSWORD = "TicketFlowDemo!2026";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await authService.login({ email, password });
      signIn(session);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      const responseData = err.response?.data;
      const validationErrors = responseData?.errors
        ? Object.values(responseData.errors).flat().join(" ")
        : "";

      setError(
        responseData?.message ||
          responseData?.detail ||
          validationErrors ||
          err.message ||
          "Unable to sign in. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label="TicketFlow">
        <div className="login-brand">
          <span className="login-brand-icon">
            <Headset size={22} />
          </span>
          <span>TicketFlow</span>
        </div>

        <div className="login-aside-copy">
          <span className="login-aside-kicker">SUPPORT OPERATIONS</span>
          <h1>Every request has a next step.</h1>
          <p>Sign in to coordinate your team and keep support moving.</p>
        </div>

        <div className="login-aside-footer">
          <span className="login-status-dot" />
          Team workspace
        </div>
      </section>

      <section className="login-main" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <span className="login-brand-icon">
              <Headset size={20} />
            </span>
            <span>TicketFlow</span>
          </div>

          <span className="login-kicker">TEAM WORKSPACE</span>
          <h2 id="login-title">Welcome back</h2>
          <p className="login-intro">Sign in to continue to your account.</p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <div className="login-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="login-submit"
              icon={ArrowRight}
            >
              Sign in
            </Button>
          </form>

          {IS_DEMO_MODE && (
            <div className="login-demo-notice">
              <strong>Try the interactive demo</strong>
              <p>
                Email: <code>{DEMO_EMAIL}</code>
                <br />
                Password: <code>{DEMO_PASSWORD}</code>
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                Fill demo login
              </button>
              <span>Demo changes are saved only in this browser.</span>
            </div>
          )}

          <p className="login-footnote">
            {IS_DEMO_MODE
              ? "This public demo uses sample data and does not connect to a live backend."
              : "Access is limited to authorized team members."}
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;