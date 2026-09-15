import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { Navbar } from "../components/Navbar";
import api from "../api/axios";

export const Posts = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useContext(AppContext);

  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate("/login");
  }, [loading, isLoggedIn, navigate]);

  const loadPosts = async () => {
    try {
      const { data } = await api.get("/api/posts");
      setPosts(data.posts || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load");
    }
  };

  useEffect(() => {
    if (!loading && isLoggedIn) loadPosts();
  }, [loading, isLoggedIn]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/posts/${editingId}`, { title, content });
        toast.success("Updated");
      } else {
        await api.post("/api/posts", { title, content });
        toast.success("Created");
      }
      setTitle("");
      setContent("");
      setEditingId(null);
      loadPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const onEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const onDelete = async (id) => {
    await api.delete(`/api/posts/${id}`);
    toast.success("Deleted");
    loadPosts();
  };

  if (loading || !isLoggedIn) return <p>Loading...</p>;

  return (
    <div className="auth-shell min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="display mb-6 text-3xl">Posts</h1>

        <form
          onSubmit={onSubmit}
          className="glass-panel mb-6 space-y-3 rounded-3xl p-6"
        >
          <input
            className="input-field"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input-field min-h-24 py-3"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="glass-panel flex justify-between items-center rounded-3xl p-5 shadow-md">
              <div>
              <h3 className="font-semibold text-xl">{post.title}</h3>
              <p className="text-sm text-[var(--muted)] text-gray-500">{post.content}</p>
              </div>
              <div className="mt-3 flex gap-2"> 
                <button type="button" className="bg-yellow-500 text-white px-4 py-2 rounded-md" onClick={() => onEdit(post)}>
                  Edit
                </button>
                <button type="button" className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => onDelete(post.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
