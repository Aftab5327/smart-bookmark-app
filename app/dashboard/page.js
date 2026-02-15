"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [deletingId, setDeletingId] = useState(null); // For delete feedback
  const router = useRouter();

  // Get user on mount
  useEffect(() => {
    getUser();
  }, []);

  // Get logged-in user
  async function getUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/");
      return;
    }

    setUser(data.user);
    fetchBookmarks(data.user.id);
    subscribeToBookmarks(data.user.id);
  }

  // Fetch bookmarks
  async function fetchBookmarks(userId) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  }

  // Subscribe to bookmark changes
  function subscribeToBookmarks(userId) {
    supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchBookmarks(userId)
      )
      .subscribe();
  }

  // Add a new bookmark
  async function addBookmark() {
    if (!title || !url) return;

    await supabase.from("bookmarks").insert([
      {
        user_id: user.id,
        title,
        url,
      },
    ]);

    setTitle("");
    setUrl("");
  }

  // Delete a bookmark (persistent and waits for confirmation)
  async function deleteBookmark(id) {
    setDeletingId(id); // show deleting feedback
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete bookmark:", error.message);
      alert("Failed to delete bookmark. Try again.");
    } else {
      fetchBookmarks(user.id); // Refresh UI after deletion
    }

    setDeletingId(null); // reset
  }

  // Logout user
  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Loading state
  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-700 font-medium">
        Loading...
      </p>
    );
  }

  // Main dashboard UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user.email}
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addBookmark}
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-center text-gray-500">
              No bookmarks added yet.
            </p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline"
              >
                {bookmark.title}
              </a>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-500 font-medium hover:text-red-700 transition"
                disabled={deletingId === bookmark.id}
              >
                {deletingId === bookmark.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
