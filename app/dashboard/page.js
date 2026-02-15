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

  // Fetch session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return console.error(error);

      if (!session?.user) return window.location.href = "/";

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

  // Fetch bookmarks for logged-in user
  const fetchBookmarks = async (uid) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("id", { ascending: false });

    if (error) return console.error("Fetch bookmarks error:", error);

    setBookmarks(data);
  };

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url) return alert("Please fill both fields");

    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: userId, title, url });

    if (error) return console.error("Add bookmark error:", error);

    setTitle("");
    setUrl("");
    fetchBookmarks(userId);
  };

  // Delete bookmark
  const deleteBookmark = async (id) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) return console.error("Delete bookmark error:", error);

    fetchBookmarks(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-green-600 font-medium mb-6">Logged in as: {userEmail}</p>

      {/* Add Bookmark Form */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Bookmark URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={addBookmark}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Bookmarks List */}
      <div className="w-full max-w-md">
        {bookmarks.length === 0 ? (
          <p className="text-gray-500">No bookmarks yet.</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bm) => (
              <li
                key={bm.id}
                className="flex justify-between items-center bg-white p-3 rounded shadow"
              >
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {bm.title}
                </a>
                <button
                  onClick={() => deleteBookmark(bm.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
