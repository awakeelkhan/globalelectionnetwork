'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, Image, Video, X, Check, AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  author: string | null;
  category: string;
  status: string;
  published_at: string;
  created_at: string;
}

const CATEGORIES = ['news', 'blog', 'announcement', 'press'];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    video_url: '',
    author: '',
    category: 'news',
    status: 'published',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?status=all&limit=50');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      showToast('Failed to fetch posts', false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save post');

      showToast(editingPost ? 'Post updated successfully' : 'Post created successfully');
      setShowForm(false);
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        video_url: '',
        author: '',
        category: 'news',
        status: 'published',
      });
      fetchPosts();
    } catch (error) {
      showToast('Failed to save post', false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image: post.featured_image || '',
      video_url: post.video_url || '',
      author: post.author || '',
      category: post.category,
      status: post.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');

      showToast('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      showToast('Failed to delete post', false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const EMPTY_FORM = { title: '', slug: '', content: '', excerpt: '', featured_image: '', video_url: '', author: '', category: 'news', status: 'published' };

  const openNew = () => { setEditingPost(null); setFormData(EMPTY_FORM); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingPost(null); };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: 'var(--bg)' }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border transition-all ${
          toast.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.ok ? <Check size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">✍️ Posts & News</h1>
            <p className="text-slate-500 text-sm mt-0.5">{posts.length} total · <span className="text-green-600 font-semibold">{posts.filter(p => p.status === 'published').length} published</span> · <span className="text-amber-600 font-semibold">{posts.filter(p => p.status === 'draft').length} drafts</span></p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-semibold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-40 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-black text-slate-900 text-lg">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <button onClick={closeForm} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
                {/* Title + Slug */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Title *</label>
                    <input type="text" required value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                      placeholder="Post headline…"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">URL Slug *</label>
                    <input type="text" required value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="post-url-slug"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                </div>

                {/* Category + Status + Author */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Author</label>
                    <input type="text" value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Excerpt <span className="font-normal text-slate-400">(short preview shown on news listing)</span></label>
                  <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2} placeholder="Brief summary of the post…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"/>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    <Image className="inline w-3.5 h-3.5 mr-1 text-slate-400"/>Featured Image URL
                  </label>
                  <input type="text" value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://example.com/image.jpg or /uploads/image.jpg"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  {formData.featured_image && (
                    <div className="mt-2 relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={formData.featured_image} alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                      <button type="button" onClick={() => setFormData({ ...formData, featured_image: '' })}
                        className="absolute top-2 right-2 bg-white/90 border border-slate-200 rounded-full p-1 text-slate-500 hover:text-red-600">
                        <X size={12}/>
                      </button>
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    <Video className="inline w-3.5 h-3.5 mr-1 text-slate-400"/>Video URL <span className="font-normal text-slate-400">(YouTube, Vimeo, etc.)</span>
                  </label>
                  <input type="text" value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Content * <span className="font-normal text-slate-400">(supports plain text or HTML)</span></label>
                  <textarea required value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12} placeholder="Write the full post content here…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400 resize-y font-mono"/>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <button type="button" onClick={closeForm}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2">
                    <Check size={14}/> {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts Table */}
        <div className="card overflow-hidden">
          {posts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl mb-3">✍️</div>
              <p className="font-bold text-slate-700 text-lg">No posts yet</p>
              <p className="text-slate-400 text-sm mt-1">Click <strong>New Post</strong> to create your first article</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Post</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Date</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-100"/>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-300 text-xl">✍️</div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate max-w-xs">{post.title}</div>
                            <div className="text-xs text-slate-400 truncate">/news/{post.slug}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {post.featured_image && <Image className="w-3 h-3 text-slate-300"/>}
                              {post.video_url && <Video className="w-3 h-3 text-slate-300"/>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 capitalize">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 hidden sm:table-cell">
                        {new Date(post.created_at || post.published_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => window.open(`/news/${post.slug}`, '_blank')}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4"/></button>
                          <button onClick={() => handleEdit(post)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(post.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
