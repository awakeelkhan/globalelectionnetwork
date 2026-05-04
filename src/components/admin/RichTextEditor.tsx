'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import LinkExt from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  ImageIcon, Youtube as YoutubeIcon, Link2, AlignLeft, AlignCenter,
  AlignRight, Code2, Minus, Undo2, Redo2, Upload, Link as LinkIcon,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function Btn({
  onClick, active, title, disabled, children,
}: {
  onClick: () => void; active?: boolean; title?: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-all text-sm ${
        active
          ? 'bg-green-100 text-green-700'
          : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 self-center shrink-0" />;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showYtInput, setShowYtInput] = useState(false);
  const [ytUrl, setYtUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ImageExt.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ controls: true, width: 640, height: 360 }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write the full post content here…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none' },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]);

  const insertImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [editor]);

  const applyLink = () => {
    if (!linkUrl) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const applyYoutube = () => {
    if (ytUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run();
    }
    setShowYtInput(false);
    setYtUrl('');
  };

  if (!editor) return (
    <div className="border border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm">
      Loading editor…
    </div>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
          <Undo2 size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
          <Redo2 size={14}/>
        </Btn>

        <Divider/>

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={14}/>
        </Btn>

        <Divider/>

        {/* Inline formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Inline code">
          <Code2 size={14}/>
        </Btn>

        <Divider/>

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet list">
          <List size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider line">
          <Minus size={14}/>
        </Btn>

        <Divider/>

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter size={14}/>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight size={14}/>
        </Btn>

        <Divider/>

        {/* Link */}
        <Btn onClick={() => { setShowLinkInput(s => !s); setShowYtInput(false); }}
          active={editor.isActive('link')} title="Insert link">
          <LinkIcon size={14}/>
        </Btn>

        {/* Image upload */}
        <Btn onClick={() => fileRef.current?.click()} title="Upload image from computer" disabled={uploading}>
          {uploading
            ? <span className="w-3.5 h-3.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin inline-block"/>
            : <Upload size={14}/>}
        </Btn>

        {/* YouTube */}
        <Btn onClick={() => { setShowYtInput(s => !s); setShowLinkInput(false); }} title="Embed YouTube video">
          <YoutubeIcon size={14}/>
        </Btn>
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
          <Link2 size={13} className="text-blue-500 shrink-0"/>
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-blue-300"
          />
          <button type="button" onClick={applyLink}
            className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700">
            Apply
          </button>
          <button type="button" onClick={() => setShowLinkInput(false)}
            className="text-xs text-blue-500 hover:text-blue-800 font-semibold px-2">
            Cancel
          </button>
        </div>
      )}

      {/* YouTube input bar */}
      {showYtInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-200">
          <YoutubeIcon size={13} className="text-red-500 shrink-0"/>
          <input
            autoFocus
            type="url"
            value={ytUrl}
            onChange={e => setYtUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyYoutube(); if (e.key === 'Escape') setShowYtInput(false); }}
            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-red-300"
          />
          <button type="button" onClick={applyYoutube}
            className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700">
            Embed
          </button>
          <button type="button" onClick={() => setShowYtInput(false)}
            className="text-xs text-red-500 hover:text-red-800 font-semibold px-2">
            Cancel
          </button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent editor={editor}/>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) insertImage(f);
        }}
      />
    </div>
  );
}
