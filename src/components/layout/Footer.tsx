'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavPage { slug: string; title: string }

export default function Footer() {
  const [s, setS]           = useState<Record<string, string>>({});
  const [navPages, setPages] = useState<NavPage[]>([]);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then(r => r.json()).then(d => setS(d.settings ?? {})).catch(() => {});
    fetch('/api/pages?published=true', { cache: 'no-store' }).then(r => r.json()).then(d =>
      setPages((d.pages ?? []).filter((p: NavPage & { show_in_nav: boolean }) => p.show_in_nav))
    ).catch(() => {});
  }, []);

  const siteName  = s.site_name    || 'Global Election Network';
  const about     = s.footer_about || 'Real-time, transparent election monitoring.';
  const email     = s.footer_email || 'info@globalelectionnetwork.com';
  const phone     = s.footer_phone;
  const address   = s.footer_address;
  const facebook  = s.footer_facebook;
  const twitter   = s.footer_twitter;
  const youtube   = s.footer_youtube;
  const copyright = s.footer_copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const col1Title = s.footer_links_col1_title || 'Quick Links';
  const col2Title = s.footer_links_col2_title || 'Resources';

  return (
    <footer style={{ background: 'linear-gradient(135deg, #052e16, #064e3b)' }}>
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🗳️</span>
              <span className="text-white font-black text-lg tracking-tight">{siteName}</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">{about}</p>
            {(facebook || twitter || youtube) && (
              <div className="flex items-center gap-3 mt-4">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Facebook">
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {twitter && (
                  <a href={twitter} target="_blank" rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Twitter / X">
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="YouTube">
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links col */}
          <div>
            <h3 className="text-white/80 font-black text-xs uppercase tracking-widest mb-4">{col1Title}</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">Results</Link></li>
              <li><Link href="/candidates" className="hover:text-white transition-colors">Candidates</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              {navPages.map((p: { slug: string; title: string }) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="hover:text-white transition-colors">{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col */}
          <div>
            <h3 className="text-white/80 font-black text-xs uppercase tracking-widest mb-4">{col2Title}</h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              {email && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">✉️</span>
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">📞</span>
                  <span>{phone}</span>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">📍</span>
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs text-center sm:text-left">{copyright}</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/observer" className="hover:text-white/60 transition-colors">Observers</Link>
            <span>·</span>
            <Link href="/login" className="hover:text-white/60 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
