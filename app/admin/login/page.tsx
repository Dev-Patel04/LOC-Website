"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/scorer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await signIn(email, password);
      setSessionCookie(cred.user.uid);
      router.push(redirect);
    } catch (err: any) {
      console.error("Login error:", err);
      // Give the exact Firebase error message string if available
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-1">LOC Admin</h1>
        <p className="text-sm text-loc-muted">Sign in to access the scorer dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-loc-card border border-loc-border text-white text-sm placeholder:text-loc-muted focus:outline-none focus:border-loc-accent transition-colors"
            placeholder="admin@loc.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-loc-muted uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-loc-card border border-loc-border text-white text-sm placeholder:text-loc-muted focus:outline-none focus:border-loc-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-loc-live text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-loc-accent text-white font-semibold text-sm hover:bg-loc-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-xs text-loc-muted mt-6">
        <a href="/scores" className="text-loc-accent hover:underline">
          Back to public site
        </a>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-loc-bg flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-loc-accent border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
