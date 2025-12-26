import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-primary">Selfy</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          <Link
            href="/"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
