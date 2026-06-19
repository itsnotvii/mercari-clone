"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth"

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
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
      if (mode === 'signup') {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold text-red-500 block mb-6">
          mercari
        </Link>

        <h1 className="text-xl font-bold mb-1">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {mode === "login" ? "Sign in to your account" : "Join the marketplace"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="coolseller123"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
            
          )}


        </form>
      </div>
    </div>
  )
  
}