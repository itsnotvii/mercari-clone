"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth";
import Button from "../components/ui/Button";
import { ShieldCheck, Sparkles, MessageCircle } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}

const perks = [
  { icon: ShieldCheck, text: "Secure checkout on every purchase, powered by Stripe" },
  { icon: Sparkles, text: "Snap a photo — AI writes your listing for you" },
  { icon: MessageCircle, text: "Message sellers directly and track offers in one place" },
];

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Marketing panel */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 15% 15%, #fff 0, transparent 40%), radial-gradient(circle at 85% 85%, #fff 0, transparent 45%)" }}
        />
        <Link href="/" className="relative text-2xl font-extrabold text-white no-underline tracking-tight w-fit">mercari</Link>

        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4 max-w-md">
            Buy and sell anything, without the hassle.
          </h2>
          <div className="flex flex-col gap-4 mt-8">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-white" />
                </div>
                <p className="text-white/90 text-sm max-w-xs">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/60 text-xs">© {new Date().getFullYear()} mercari clone</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-2xl font-extrabold text-[var(--color-brand)] block mb-6 no-underline tracking-tight lg:hidden">mercari</Link>
          <h1 className="text-2xl font-extrabold mb-1 tracking-tight">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-[var(--color-muted)] text-sm mb-7">{mode === "login" ? "Sign in to your account" : "Join the marketplace in seconds"}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className={labelClass}>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="coolseller123" className={inputClass} />
              </div>
            )}
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={inputClass} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="text-center text-sm text-[var(--color-muted)] mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[var(--color-brand)] font-semibold">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
