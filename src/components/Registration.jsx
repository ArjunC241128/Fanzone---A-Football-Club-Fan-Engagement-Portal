import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const FRIENDLY_ERRORS = {
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/network-request-failed": "Network error — check your internet connection.",
  "auth/operation-not-allowed": "Email/Password sign-in isn't enabled for this project yet (Firebase Console → Authentication → Sign-in method).",
  "auth/admin-registration-blocked": "That email is reserved for the club admin account. Please use a different email, or log in instead if this is you."
};

export default function Registration() {
  const { currentUser, role, loading, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && role) {
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [currentUser, role, loading]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration failed:", err.code || err.message, err);
      setError(FRIENDLY_ERRORS[err.code] || `Something went wrong (${err.code || err.message || "unknown error"}).`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-concrete) px-4">
      <div className="w-full max-w-sm rounded-md bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
            Chattogram Titans Fanzone
          </span>
          <h1 className="mt-2 font-(family-name:--font-display) text-3xl text-(--color-pitch)">
            Join Fanzone
          </h1>
          <p className="mt-2 text-sm text-(--color-ink)/60">
            Create your fan account to book tickets, RSVP to matches, and follow every Titans matchday.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink)/60">
              Full name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-sm border border-(--color-ink)/15 px-3 py-2.5 text-sm outline-none focus:border-(--color-gold) focus:ring-2 focus:ring-(--color-gold)/25"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink)/60">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-(--color-ink)/15 px-3 py-2.5 text-sm outline-none focus:border-(--color-gold) focus:ring-2 focus:ring-(--color-gold)/25"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink)/60">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-(--color-ink)/15 px-3 py-2.5 text-sm outline-none focus:border-(--color-gold) focus:ring-2 focus:ring-(--color-gold)/25"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="rounded-sm bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-sm bg-(--color-kit) px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-(--color-kit-dark) disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--color-ink)/60">
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-(--color-kit) hover:text-(--color-kit-dark)">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
