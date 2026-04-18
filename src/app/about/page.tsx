'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Target, Eye, Users, HeartHandshake, Building2, Award, CheckCircle } from 'lucide-react';

const LEADERSHIP = [
  { name: 'Abdul Wakeel',    role: 'Director Digital Transformation', initials: 'AW', color: ['#22c55e', '#16a34a'], desc: 'Leads overall strategic direction and operations of the network.' },
  { name: 'Naveed Ahmed',    role: 'Director of Field Operations', initials: 'NA', color: ['#3b82f6', '#2563eb'], desc: 'Oversees observer deployment and field monitoring activities.' },
  { name: 'Aliya Qaiser',    role: 'Director of Communications',  initials: 'AQ', color: ['#a855f7', '#7c3aed'], desc: 'Manages public outreach, media relations, and stakeholder engagement.' },
  { name: 'Naeem Ahmed Bajwa', role: 'Director of Research',      initials: 'NB', color: ['#f59e0b', '#d97706'], desc: 'Leads data analysis, research programs, and election integrity studies.' },
];

const FOCUS_AREAS = [
  { icon: Users, title: 'Local Observer Networks', desc: 'Strengthening grassroots monitoring capabilities' },
  { icon: Award, title: 'Data Collection & Verification', desc: 'Enhancing accuracy and reliability of election data' },
  { icon: Eye, title: 'Public Transparency Tools', desc: 'Providing open access to election information' },
  { icon: HeartHandshake, title: 'Civic Engagement', desc: 'Supporting institutional and community participation' },
];

const COLLABORATIONS = [
  'Development organizations',
  'Research institutions',
  'Civic and governance bodies',
  'Technology partners',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 45%, #0a6640 70%, #1a7a4a 100%)' }}>
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Shield className="w-4 h-4 text-green-300" />
            <span className="text-white text-sm font-semibold">Independent Election Observation Network</span>
          </div>
          <h1 className="hero-title text-white mb-6">About Us</h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            We are an independent election observation network committed to strengthening democratic processes through transparency, accountability, and public engagement.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <Target className="w-7 h-7 text-white" />
            </div>
            <h2 className="section-title mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To promote free, fair, and transparent elections by empowering observers, strengthening monitoring systems, and providing reliable insights to the public and stakeholders.
            </p>
          </div>
          <div className="card p-8 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h2 className="section-title mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              A democratic society where every election is conducted with integrity, where citizens trust the process, and where transparency is not optional but foundational.
            </p>
          </div>
        </div>
      </section>

      {/* Strategic Approach */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Strategic Approach</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our strategy is built on a combination of technology, field observation, and data-driven insights.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOCUS_AREAS.map((area, i) => (
              <div key={i} className="card p-6 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: area.icon === Users ? '#dcfce7' : area.icon === Award ? '#dbeafe' : area.icon === Eye ? '#fef3c7' : '#fce7f3' }}>
                  <area.icon className="w-6 h-6" style={{ color: area.icon === Users ? '#16a34a' : area.icon === Award ? '#2563eb' : area.icon === Eye ? '#d97706' : '#db2777' }} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{area.title}</h3>
                <p className="text-sm text-slate-600">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding & Sustainability */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title mb-6">Funding & Sustainability</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our initiative is designed to operate with transparency and sustainability, supported through partnerships, grants, and institutional collaborations. We aim to build a model that ensures independence while maintaining operational excellence.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">Transparent & Independent</span>
            </div>
          </div>
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-brand-600" />
              <h3 className="font-bold text-slate-900">We welcome collaboration with:</h3>
            </div>
            <ul className="space-y-3">
              {COLLABORATIONS.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-4">Leadership</h2>
            <p className="text-slate-400">Meet our team of dedicated professionals</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEADERSHIP.map((leader, i) => (
              <div key={i} className="group">
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
                  <div className="relative mx-auto mb-5 w-fit">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${leader.color[0]}, ${leader.color[1]})` }}>
                      {leader.initials}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: leader.color[0] }}>
                      <span className="text-white text-[8px] font-black">GEN</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{leader.name}</h3>
                  <p className="text-xs font-semibold mt-1.5 mb-3 px-2 py-1 rounded-full inline-block"
                    style={{ background: leader.color[0] + '18', color: leader.color[1] }}>
                    {leader.role}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{leader.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
