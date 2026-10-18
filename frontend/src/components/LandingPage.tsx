import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  Mic,
  Camera,
  Layers,
  Cpu,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  Ambulance,
  Building2,
  Shield,
  Zap,
  BarChart3,
  Clock,
  ChevronRight,
  Database,
  Code2,
} from 'lucide-react';
import { SupportedLanguage } from '../features/voice';
import { Role } from '../types';

interface LandingPageProps {
  onOpenAuth: () => void;
  onExplorePlatform: (role?: Role) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExplorePlatform,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'multimodal' | 'safety' | 'architecture'>('overview');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">FAME-GENIX</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                  AI Risk Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Continuous Risk Prediction & Emergency Intelligence</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-cyan-400 transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('multimodal')} className="hover:text-cyan-400 transition-colors">
              Multimodal AI
            </button>
            <button onClick={() => scrollToSection('safety')} className="hover:text-cyan-400 transition-colors">
              Safety Engine
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-900">
        {/* Subtle Background Grid Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Assisted Multi-Factor Health Monitoring & Emergency Orchestration</span>
            </div>

            {/* Hero Headline */}
            <h1 className="tracking-tight leading-tight flex flex-col items-center gap-2">
              <span className="text-white text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wider">
                FAME GENIX
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent text-xl sm:text-3xl md:text-4xl font-bold whitespace-nowrap">
                AI-Powered Smart Health Monitoring
              </span>
            </h1>

            {/* Supporting Subtext */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-medium max-w-4xl mx-auto whitespace-nowrap">
              Turning everyday health signals into early insights, smarter decisions, and timely care.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Explore FAME GENIX</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuth}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Sign In To Role Portals</span>
              </button>
            </div>

            {/* Proof Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-[11px] text-slate-400 font-medium">
              {['Multimodal AI', 'Explainable Risk', 'Doctor Triage', 'Simulated Escalation'].map((chip) => (
                <span key={chip} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 3. HERO VISUAL MOCKUP */}
          <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl shadow-cyan-950/50 overflow-hidden">
            {/* Glowing Accent Border */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Dashboard Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 ml-2">FAME-GENIX // CLINICAL RISK COMMAND CENTER</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SYSTEM ACTIVE</span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
              {/* Left Column: Core Risk Metrics */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Multi-Factor Risk Fusion</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Health Stability Score</span>
                  <span className="text-xl font-bold text-emerald-400">86.0 <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400">Risk Score</span>
                  <span className="text-xl font-bold text-amber-400">42 <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400">Assessment Confidence</span>
                  <span className="text-xl font-bold text-cyan-400">81%</span>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold w-full text-center">
                    Suggested Response: MONITOR
                  </span>
                </div>
              </div>

              {/* Center Column: Wearable Telemetry Vitals */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>FAME Smart Mask Telemetry</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Heart Rate</div>
                    <div className="text-base font-bold text-white mt-0.5">72 <span className="text-[9px] font-normal text-slate-500">BPM</span></div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Blood Oxygen</div>
                    <div className="text-base font-bold text-cyan-400 mt-0.5">98%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Resp. Rate</div>
                    <div className="text-base font-bold text-blue-400 mt-0.5">16 <span className="text-[9px] font-normal text-slate-500">/min</span></div>
                  </div>
                </div>

                {/* Simulated Waveform Line */}
                <div className="h-16 w-full bg-slate-900/60 rounded-lg p-2 flex items-center justify-center">
                  <div className="w-full flex items-center justify-between text-[9px] font-mono text-cyan-400/80">
                    <span>EWMA Drift: STABLE</span>
                    <span>Z-Score: +0.4σ</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Multimodal Feature Floating Badges */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300">Connected Intelligence Floating Badges</div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2"><Mic className="w-3.5 h-3.5 text-cyan-400" /> Multilingual Voice (EN/TE/HI)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2"><Camera className="w-3.5 h-3.5 text-emerald-400" /> AI Visual Observations</span>
                    <span className="text-[10px] text-cyan-400 font-mono">READY</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-amber-400" /> Medical Report OCR</span>
                    <span className="text-[10px] text-cyan-400 font-mono">READY</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5 text-purple-400" /> Doctor Triage Command</span>
                    <span className="text-[10px] text-emerald-400 font-mono">SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST / CAPABILITY STRIP */}
      <section className="py-6 bg-slate-900/60 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-[11px] font-semibold text-slate-300">
            {[
              { label: 'TEXT + VOICE', icon: Mic },
              { label: 'IMAGE ANALYSIS', icon: Camera },
              { label: 'LAB REPORTS', icon: FileText },
              { label: 'MASK TELEMETRY', icon: Activity },
              { label: 'AI RISK FUSION', icon: Sparkles },
              { label: 'CLINICIAN REVIEW', icon: Stethoscope },
              { label: 'EMERGENCY WORKFLOW', icon: Ambulance },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center gap-1.5 hover:border-cyan-500/40 transition-colors">
                  <IconComp className="w-4 h-4 text-cyan-400" />
                  <span className="tracking-wider">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PROBLEM SECTION */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-rose-400 uppercase tracking-widest">The Healthcare Gap</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Healthcare often reacts after symptoms become obvious.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-rose-800/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Delayed Recognition</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                People may not realize that their underlying physiological health signals are deteriorating until severe symptoms force emergency hospital admission.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-amber-800/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fragmented Health Data</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Patient symptoms, wearable sensor telemetry, lab blood reports, and visual observations are often evaluated separately in isolated data silos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-cyan-800/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Poor Escalation Pathways</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Even when deterioration is detected, conventional consumer tools lack a structured clinical pathway connecting warnings to clinicians and emergency dispatches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOLUTION SECTION */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Unified Platform Solution</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">One intelligence layer across the entire health journey.</h3>
          </div>

          {/* Flow Diagram */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-cyan-300">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">TEXT & SPEECH</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">VISUAL PHOTOS</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">LAB REPORTS</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">MASK TELEMETRY</span>
            </div>

            <div className="text-cyan-400 font-bold text-lg animate-bounce">↓</div>

            <div className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/20">
              FAME GENIX MULTI-FACTOR INTELLIGENCE ENGINE
            </div>

            <div className="text-cyan-400 font-bold text-lg animate-bounce">↓</div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <span className="px-4 py-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800">Risk Fusion Score</span>
              <span className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800">Confidence %</span>
              <span className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800">Suggested Care Level</span>
            </div>

            <div className="text-cyan-400 font-bold text-lg animate-bounce">↓</div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-white">
              <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700">PATIENT PORTAL</span>
              <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700">DOCTOR TRIAGE</span>
              <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700">EMERGENCY OPS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW FAME GENIX WORKS (6-Step Timeline) */}
      <section id="how-it-works" className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">End-to-End Orchestration</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">How FAME GENIX Operates</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: 'STEP 1', title: 'Understand', text: 'Patient submits symptoms through text or multilingual voice (English, Telugu, Hindi).' },
              { step: 'STEP 2', title: 'Observe', text: 'Optional visual photos, lab report PDFs, and simulated FAME Mask telemetry add physiological context.' },
              { step: 'STEP 3', title: 'Compare', text: 'Current physiology is compared against the patient’s longitudinal personal baseline.' },
              { step: 'STEP 4', title: 'Detect', text: 'EWMA drift, Z-score anomaly detection, ML risk, and deterministic safety rules evaluate subtle change.' },
              { step: 'STEP 5', title: 'Explain', text: 'FAME GENIX separates Risk Score, Assessment Confidence, and Care Level, explaining why.' },
              { step: 'STEP 6', title: 'Escalate', text: 'Priority cases enter clinician review and a 9-stage simulated emergency-response workflow.' },
            ].map((st, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-cyan-500/40 transition-colors">
                <div className="text-[10px] font-mono font-bold text-cyan-400 px-2.5 py-1 rounded bg-slate-950 border border-cyan-800/60 w-fit">
                  {st.step}
                </div>
                <h4 className="text-base font-bold text-white">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. MULTIMODAL INTELLIGENCE SECTION */}
      <section id="multimodal" className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Multimodal Inputs</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">More than a symptom checker.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h4 className="text-base font-bold text-white">Text Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured clinical concept extraction from natural text descriptions using fallback medical dictionaries and Gemini AI.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Mic className="w-6 h-6 text-emerald-400" />
              <h4 className="text-base font-bold text-white">Multilingual Voice</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native Speech-to-Text & Text-to-Speech support across English, Telugu, and Hindi for inclusive patient access.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Camera className="w-6 h-6 text-blue-400" />
              <h4 className="text-base font-bold text-white">Visual Observations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI-assisted non-diagnostic photo observations and live camera capture for skin, throat, or eye symptoms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText className="w-6 h-6 text-amber-400" />
              <h4 className="text-base font-bold text-white">Medical Report OCR</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured lab report parsing for CBC, Glucose, and Lipid panels preserving printed reference ranges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 col-span-1 md:col-span-2">
              <Activity className="w-6 h-6 text-purple-400" />
              <h4 className="text-base font-bold text-white">Continuous Telemetry</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulated FAME Smart Mask physiological streams: Heart Rate, SpO2, Respiratory Rate, Temp, and VOC Exhale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. HEALTH DRIFT SECTION */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Early Drift Detection</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Detect the direction, not just the number.</h3>
            <p className="text-xs text-slate-400">
              Progressive physiological changes matter even before an isolated reading crosses an extreme threshold.
            </p>
          </div>

          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">SpO2 Progressive Drift:</span>
              <span className="text-cyan-400 font-bold">98% → 97% → 96% → 94% → 92% → 89%</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">EWMA Score</div>
                <div className="text-sm font-bold text-amber-400 mt-1">Deteriorating</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Trend Slope</div>
                <div className="text-sm font-bold text-rose-400 mt-1">-1.4% / hr</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Baseline Deviation</div>
                <div className="text-sm font-bold text-rose-400 mt-1">-5.2%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. EXPLAINABLE RISK SECTION */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Explainable AI</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">AI decisions should be understandable.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-rose-400 uppercase">01. Risk Score</div>
              <h4 className="text-base font-bold text-white">Signal Severity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measures how concerning the combined vitals, symptoms, and telemetry signals are on a 0-100 scale.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase">02. Assessment Confidence</div>
              <h4 className="text-base font-bold text-white">Evidence Quality</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measures how complete and reliable the available sensor readings and reported symptoms are.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase">03. Care Level</div>
              <h4 className="text-base font-bold text-white">Triage Action Guidance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Categorizes response level from STABLE to POSSIBLE_EMERGENCY based on rule safety thresholds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SAFETY ENGINE SECTION */}
      <section id="safety" className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Clinical Safety Guarantee</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">AI where useful. Rules where safety matters.</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              FAME GENIX does NOT allow generative AI models to independently dispatch ambulances or change care levels without deterministic safety rule validation.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono font-bold">
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/60 text-cyan-300">
                Gemini AI
                <div className="text-[9px] font-normal text-slate-500 mt-1">Understanding & Explanation</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-blue-800/60 text-blue-300">
                Logistic Regression
                <div className="text-[9px] font-normal text-slate-500 mt-1">Symptom Risk ML</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-purple-800/60 text-purple-300">
                EWMA / Z-Score
                <div className="text-[9px] font-normal text-slate-500 mt-1">Deterioration Engine</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200">
                Safety Rules RF-001..007
                <div className="text-[9px] font-normal text-rose-300 mt-1">Deterministic Red-Flags</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-800/60 text-emerald-300">
                Clinician Triage
                <div className="text-[9px] font-normal text-slate-500 mt-1">Human Decision Review</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 16. MODEL TRANSPARENCY SECTION */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Model Benchmark & Transparency</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Empirical ML Metrics</h3>
          </div>

          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Accuracy</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">~96.0%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Precision</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">~89.7%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Recall</div>
                <div className="text-lg font-bold text-amber-400 mt-1">100.0%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">F1 Score</div>
                <div className="text-lg font-bold text-purple-400 mt-1">~94.6%</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400 text-center border border-slate-800">
              <strong>Notice: </strong> Synthetic prototype evaluation. These results demonstrate software validation and are not clinical validation or real-patient diagnostic accuracy.
            </div>
          </div>
        </div>
      </section>

      {/* 17. ROLE ECOSYSTEM SECTION */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Multi-Role Ecosystem</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">5 Connected Role Portals</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { role: 'PATIENT', label: 'Patient Portal', desc: 'Vitals, symptoms, voice & image inputs', icon: UserCheck, color: 'text-cyan-400' },
              { role: 'DOCTOR', label: 'Doctor CDS', desc: 'Clinical queue, triage & review', icon: Stethoscope, color: 'text-purple-400' },
              { role: 'EMERGENCY_OPERATOR', label: 'Emergency Ops', desc: 'Verify cases & dispatch units', icon: Building2, color: 'text-rose-400' },
              { role: 'AMBULANCE_TEAM', label: 'Ambulance Unit', desc: 'Transit tracking & hospital handoff', icon: Ambulance, color: 'text-amber-400' },
              { role: 'SYSTEM_ADMIN', label: 'Admin Audit', desc: 'ML metrics, audit logs & system health', icon: Shield, color: 'text-emerald-400' },
            ].map((r) => {
              const RoleIcon = r.icon;
              return (
                <div
                  key={r.role}
                  onClick={onOpenAuth}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-all group space-y-2"
                >
                  <RoleIcon className={`w-6 h-6 ${r.color}`} />
                  <div className="font-bold text-xs text-white group-hover:text-cyan-300">{r.label}</div>
                  <div className="text-[11px] text-slate-400">{r.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 19. FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">From health signals to meaningful action.</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Experience the FAME GENIX connected health intelligence prototype.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* 20. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">FAME-GENIX</span>
              <span className="text-[10px] text-slate-400">• AI-Assisted Health Monitoring & Risk Intelligence</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-cyan-400">How It Works</button>
              <button onClick={() => scrollToSection('safety')} className="hover:text-cyan-400">Safety Engine</button>
              <button onClick={onOpenAuth} className="hover:text-cyan-400">Sign In</button>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 text-center sm:text-left">
            FAME GENIX is a research/hackathon prototype and is not a medical diagnostic device or substitute for licensed professional clinical care.
          </p>
        </div>
      </footer>
    </div>
  );
};
