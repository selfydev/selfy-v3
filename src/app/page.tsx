import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              <span className="text-xl font-bold text-white">Selfy</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Book Your Perfect
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Experience
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Professional photo booth services for events, parties, and corporate functions.
            Easy booking, seamless experience.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Browse Services
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/20 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Photo Booth Rentals</h3>
            <p className="mt-2 text-slate-400">
              Premium photo booths for any occasion. Classic, modern, and 360° options available.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Easy Scheduling</h3>
            <p className="mt-2 text-slate-400">
              Book online in minutes. Choose your date, package, and add-ons with our simple booking system.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Corporate Packages</h3>
            <p className="mt-2 text-slate-400">
              Special rates and credit packages for businesses. Flexible billing and net payment terms.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Selfy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
