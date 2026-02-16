"use client";

import { supabase } from "./lib/supabase";

export default function LoginPage() {
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
          Smart Bookmark App
        </h1>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-blue-100 text-blue-800 font-semibold px-6 py-3 rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
        >
          {/* Optional Google Icon */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.5h146.9c-6.3 34.1-25.1 62.9-53.4 82.2v68h86.2c50.6-46.5 80.8-115.2 80.8-195.3z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c72.7 0 133.8-24.1 178.3-65.4l-86.2-68c-24 16.1-55 25.6-92.1 25.6-70.8 0-130.8-47.8-152.2-112.3h-89.4v70.6c44.2 87.3 134 149.5 241.6 149.5z"
              fill="#34A853"
            />
            <path
              d="M119.5 329.8c-10.7-31.4-10.7-65.6 0-97l-89.4-70.6c-39.6 77.2-39.6 168.6 0 245.8l89.4-78.2z"
              fill="#FBBC05"
            />
            <path
              d="M272 107.6c38.6-.6 75.7 13.9 104.1 40.3l78.1-78.1C406.1 24.2 345.1 0 272 0 164.4 0 74.6 62.2 30.4 149.5l89.4 70.6C141.2 155.4 201.2 107.6 272 107.6z"
              fill="#EA4335"
            />
          </svg>

          Login with Google
        </button>
      </div>
    </div>
  );
}
