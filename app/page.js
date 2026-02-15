"use client";

import { supabase } from "./lib/supabase";

export default function LoginPage() {
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL, // must match Vercel URL
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Smart Bookmark App
        </h1>

        <button
          onClick={loginWithGoogle}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
