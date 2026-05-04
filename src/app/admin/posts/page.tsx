'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, Image, Video, X, Check, AlertCircle, Upload, Link2, Grid, Facebook } from 'lucide-react';

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

const CATEGORIES = ['Elections', 'Government Meeting', 'Analysis', 'Technology', 'International', 'Press', 'News', 'Announcement'];

type ImageTab = 'url' | 'upload' | 'gallery' | 'facebook';

function toYouTubeEmbed(url: string): string {
  if (!url) return url;
  if (url.includes('/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

function ImagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<ImageTab>('url');
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [urlInput, setUrlInput] = useState(value);
  const [fbInput, setFbInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === 'gallery') {
      fetch('/api/uploads').then(r => r.json()).then(d => setGallery(d.images || [])).catch(() => {});
    }
  }, [tab]);

  useEffect(() => { setUrlInput(value); }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
        setTab('url');
      } else {
        setUploadErr(data.error || 'Upload failed');
      }
    } catch {
      setUploadErr('Upload failed — please try again');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const TABS: { id: ImageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL', icon: <Link2 size={13}/> },
    { id: 'upload', label: 'Upload', icon: <Upload size={13}/> },
    { id: 'gallery', label: 'Gallery', icon: <Grid size={13}/> },
    { id: 'facebook', label: 'Facebook', icon: <Facebook size={13}/> },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
              tab === t.id ? 'border-green-600 text-green-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {tab === 'url' && (
          <div className="flex gap-2">
            <input type="text" value={urlInput}
              onChange={e => { setUrlInput(e.target.value); onChange(e.target.value); }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
            {urlInput && <button type="button" onClick={() => { setUrlInput(''); onChange(''); }} className="text-slate-400 hover:text-red-500 px-2"><X size={14}/></button>}
          </div>
        )}

        {tab === 'upload' && (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-green-600">
                  <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"/>
                  <span className="text-sm font-semibold">Uploading…</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Upload size={28}/>
                  <p className="text-sm font-semibold text-slate-600">Click to browse or drag &amp; drop</p>
                  <p className="text-xs">JPG, PNG, GIF, WebP, SVG · max 10 MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
            {uploadErr && <p className="text-xs text-red-600 mt-2 font-semibold">⚠ {uploadErr}</p>}
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            {gallery.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Grid size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No uploaded images yet</p>
                <p className="text-xs mt-1">Upload images first to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                {gallery.map(url => (
                  <button key={url} type="button" onClick={() => { onChange(url); setTab('url'); }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                      value === url ? 'border-green-500 ring-2 ring-green-300' : 'border-transparent hover:border-slate-300'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover"/>
                    {value === url && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <Check size={16} className="text-green-700"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'facebook' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="text" value={fbInput}
                onChange={e => setFbInput(e.target.value)}
                placeholder="Paste Facebook image URL…"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <button type="button"
                onClick={() => { if (fbInput) { onChange(fbInput); setTab('url'); } }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                Use
              </button>
            </div>
            <p className="text-xs text-slate-400">⚠ The Facebook image must be set to <strong>Public</strong> — private/friends-only images will not display on your site.</p>
            <p className="text-xs text-slate-400">Tip: right-click the Facebook image → <em>Copy image address</em>, then paste above.</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="border-t border-slate-100 px-4 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Preview</p>
          <div className="relative h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img src={value} alt="Preview" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            <button type="button" onClick={() => { onChange(''); setUrlInput(''); setFbInput(''); }}
              className="absolute top-2 right-2 bg-white/90 border border-slate-200 rounded-full p-1 text-slate-500 hover:text-red-600">
              <X size={12}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
                    <input type="text" value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      list="category-list"
                      placeholder="e.g. Elections"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                    <datalist id="category-list">
                      {CATEGORIES.map(c => <option key={c} value={c}/>)}
                    </datalist>
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
                    <Image className="inline w-3.5 h-3.5 mr-1 text-slate-400"/>Featured Image
                  </label>
                  <ImagePicker
                    value={formData.featured_image}
                    onChange={v => setFormData({ ...formData, featured_image: v })}
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    <Video className="inline w-3.5 h-3.5 mr-1 text-slate-400"/>Video URL <span className="font-normal text-slate-400">(YouTube watch link or youtu.be short link)</span>
                  </label>
                  <input type="text" value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                  {formData.video_url && (() => {
                    const embedUrl = toYouTubeEmbed(formData.video_url);
                    return (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-black">
                        <iframe width="100%" height="220" src={embedUrl} title="Video preview"
                          frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen className="rounded-xl"/>
                      </div>
                    );
                  })()}
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
