"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) return console.error(error);

      if (!session?.user) return (window.location.href = "/");

      setUserEmail(session.user.email);
      setUserId(session.user.id);
      setLoading(false);

      fetchBookmarks(session.user.id);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        setLoading(false);
        fetchBookmarks(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchBookmarks = async (uid) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("id", { ascending: false });

    if (error) return console.error(error);

    setBookmarks(data);
  };

  const addBookmark = async () => {
    if (!title || !url) return alert("Please fill both fields");

    const { error } = await supabase.from("bookmarks").insert({ user_id: userId, title, url });

    if (error) return console.error("Add bookmark error:", error);

    setTitle("");
    setUrl("");
    fetchBookmarks(userId);
  };

  const deleteBookmark = async (id) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) return console.error("Delete bookmark error:", error);

    fetchBookmarks(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all your saved links in one clean space.</p>
          <div className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Logged in as: <span className="ml-1 font-semibold text-slate-900">{userEmail}</span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Add Bookmark</h2>
            <p className="mt-1 text-sm text-slate-500">Add a title and URL to save a new bookmark.</p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Bookmark title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={addBookmark}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
              >
                Save Bookmark
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Your Bookmarks</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {bookmarks.length} total
              </span>
            </div>

            {bookmarks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                No bookmarks yet. Add your first one from the box on the left.
              </div>
            ) : (
              <ul className="space-y-3">
                {bookmarks.map((bm) => (
                  <li
                    key={bm.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-base font-medium text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        {bm.title}
                      </a>
                      <p className="mt-1 truncate text-sm text-slate-500">{bm.url}</p>
                    </div>
                    <button
                      onClick={() => deleteBookmark(bm.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
