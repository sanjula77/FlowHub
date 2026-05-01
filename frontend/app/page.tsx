'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Users,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-base font-bold text-gray-900">FlowHub</span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'How it works', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link href="/signup"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                Get started
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-50 to-transparent rounded-full opacity-60 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700 mb-8">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Now available — FlowHub 2.0
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Ship projects{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">faster</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
            {' '}with your team
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            FlowHub brings your projects, tasks, and team into one clean workspace.
            Plan, track, and deliver — without the chaos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/signup"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-blue-100 w-full sm:w-auto justify-center">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors w-full sm:w-auto justify-center">
              Sign in to dashboard
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {['bg-blue-400', 'bg-violet-400', 'bg-emerald-400', 'bg-amber-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                  <span className="text-white text-xs font-medium">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <span>Trusted by <span className="text-gray-700 font-medium">2,000+</span> teams worldwide</span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-5 bg-white border border-gray-200 rounded-md flex items-center px-3">
                  <span className="text-xs text-gray-400">app.flowhub.dev/dashboard</span>
                </div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="bg-gray-50 flex">
              {/* Mock sidebar */}
              <div className="w-48 bg-white border-r border-gray-100 p-3 hidden sm:block">
                <div className="flex items-center gap-2 p-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
                {['Dashboard', 'Projects', 'Tasks', 'Team'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-1 ${i === 0 ? 'bg-blue-50' : ''}`}>
                    <div className={`w-3.5 h-3.5 rounded ${i === 0 ? 'bg-blue-400' : 'bg-gray-200'}`} />
                    <div className={`h-2.5 rounded ${i === 0 ? 'bg-blue-200 w-16' : 'bg-gray-200 w-12'}`} />
                  </div>
                ))}
              </div>

              {/* Mock main content */}
              <div className="flex-1 p-5">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Projects', val: '12', color: 'bg-blue-50' },
                    { label: 'Active', val: '47', color: 'bg-violet-50' },
                    { label: 'Members', val: '8', color: 'bg-emerald-50' },
                    { label: 'Done', val: '93', color: 'bg-amber-50' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className={`${color} rounded-xl p-3`}>
                      <div className="h-2 w-10 bg-gray-300 rounded mb-2" />
                      <div className="text-lg font-bold text-gray-700">{val}</div>
                    </div>
                  ))}
                </div>

                {/* Content rows */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-4">
                    <div className="h-2.5 w-24 bg-gray-200 rounded mb-4" />
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg" />
                        <div className="flex-1">
                          <div className={`h-2 bg-gray-200 rounded mb-1.5 w-${['32', '24', '28'][i-1]}`} />
                          <div className="h-1.5 bg-gray-100 rounded w-20" />
                        </div>
                        <div className="w-16 h-5 bg-gray-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="h-2.5 w-16 bg-gray-200 rounded mb-4" />
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-2 py-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-violet-400" />
                        <div className="h-2 bg-gray-100 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,000+', label: 'Teams using FlowHub' },
              { value: '50k+', label: 'Tasks completed' },
              { value: '99.9%', label: 'Uptime guarantee' },
              { value: '< 2s', label: 'Average load time' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              Features
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything your team needs</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              One platform to plan, track, and deliver your best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FolderKanban,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                title: 'Project Management',
                desc: 'Organize work into clear projects with descriptions, deadlines, and team ownership.',
              },
              {
                icon: CheckCircle2,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                title: 'Task Tracking',
                desc: 'Create tasks, set priorities, assign to teammates, and move through a Kanban board.',
              },
              {
                icon: Users,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                title: 'Team Collaboration',
                desc: 'Invite members, assign roles (Owner, Manager, Member), and collaborate in real time.',
              },
              {
                icon: BarChart3,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                title: 'Analytics & Insights',
                desc: 'Get visibility into team performance, task completion rates, and project health.',
              },
              {
                icon: Shield,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
                title: 'Role-Based Access',
                desc: 'Fine-grained permissions. Admins, managers, and members each see what they need.',
              },
              {
                icon: Zap,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                title: 'Fast & Reliable',
                desc: 'Built on a modern NestJS + Next.js stack with 99.9% uptime and sub-2s load times.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title}
                className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 mb-4">
              How it works
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-gray-500">No complex setup. Just sign up and start shipping.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent hidden lg:block" />

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Create your account',
                  desc: 'Sign up in seconds. Your personal team is created automatically — no configuration needed.',
                  color: 'bg-blue-600',
                },
                {
                  step: '02',
                  title: 'Invite your team',
                  desc: 'Send email invites to teammates. Assign roles and they can start collaborating immediately.',
                  color: 'bg-violet-600',
                },
                {
                  step: '03',
                  title: 'Ship great work',
                  desc: 'Create projects, break them into tasks, track progress on Kanban boards, and celebrate wins.',
                  color: 'bg-emerald-600',
                },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center text-white text-sm font-bold mb-6 shadow-lg`}>
                    {step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              Pricing
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500 text-sm">/ forever</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Perfect for small teams getting started.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 5 team members', 'Unlimited projects', 'Kanban boards', 'Task comments & labels', 'Basic analytics'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 bg-blue-600 rounded-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                  Most popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-1">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$12</span>
                  <span className="text-blue-200 text-sm">/ user / month</span>
                </div>
                <p className="text-sm text-blue-100 mt-2">For growing teams that need more power.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited team members', 'Everything in Free', 'Advanced analytics', 'Priority support', 'Admin controls & audit logs', 'Custom labels & workflows'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <Check className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-blue-50 text-blue-700 text-sm font-medium rounded-xl transition-colors">
                Start Pro trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Loved by teams</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "FlowHub completely replaced Jira and Notion for us. Everything is in one place and the team actually uses it.",
                name: 'Sarah K.',
                role: 'Engineering Lead',
                initials: 'SK',
                color: 'from-blue-400 to-indigo-500',
              },
              {
                quote: "We went from chaotic Slack threads to structured projects in a week. The Kanban board is perfect for our workflow.",
                name: 'Marcus T.',
                role: 'Product Manager',
                initials: 'MT',
                color: 'from-violet-400 to-purple-500',
              },
              {
                quote: "The role-based access control is exactly what we needed. Our clients can see their projects without seeing everything else.",
                name: 'Priya R.',
                role: 'Agency Owner',
                initials: 'PR',
                color: 'from-emerald-400 to-teal-500',
              },
            ].map(({ quote, name, role, initials, color }) => (
              <div key={name} className="p-6 bg-white border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl px-8 py-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to ship faster?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of teams using FlowHub to plan, track, and deliver their best work.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-xl transition-colors shadow-lg w-full sm:w-auto justify-center">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-colors w-full sm:w-auto justify-center">
                  Sign in
                </Link>
              </div>
              <p className="mt-5 text-blue-200 text-sm">No credit card required · Free forever plan available</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span className="text-sm font-bold text-gray-900">FlowHub</span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Sign in', href: '/login' },
                { label: 'Sign up', href: '/signup' },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  {label}
                </a>
              ))}
            </div>

            <p className="text-sm text-gray-400">© 2026 FlowHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
