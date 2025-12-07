import MarketingLayout from '@/components/marketing/MarketingLayout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <MarketingLayout>
      <div className="relative isolate overflow-hidden">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              Welcome to Selfy v3
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              Sprint 1: Minimal Next.js 15 app with Tailwind CSS and design tokens. Built with
              TypeScript and the App Router.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Go to Dashboard
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-neutral-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Sprint 1</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need to get started
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900">
                  <div className="h-10 w-10 rounded-lg bg-primary-600"></div>
                  Next.js 15
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">
                    Built with the latest Next.js App Router and React Server Components.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900">
                  <div className="h-10 w-10 rounded-lg bg-secondary-600"></div>
                  Tailwind CSS
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">
                    Utility-first CSS framework with custom design tokens for consistent styling.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900">
                  <div className="h-10 w-10 rounded-lg bg-success-DEFAULT"></div>
                  TypeScript
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">Fully typed with strict mode for better DX and fewer bugs.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-primary-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Sprint 1 Status
              </h2>
              <div className="mt-8 space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-success-DEFAULT">✓</span>
                  <span className="text-neutral-700">Next.js 15 with App Router</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-success-DEFAULT">✓</span>
                  <span className="text-neutral-700">Tailwind CSS configured</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-success-DEFAULT">✓</span>
                  <span className="text-neutral-700">Design tokens file created</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-success-DEFAULT">✓</span>
                  <span className="text-neutral-700">Marketing layout with header/footer</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-success-DEFAULT">✓</span>
                  <span className="text-neutral-700">Dashboard layout with sidebar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
