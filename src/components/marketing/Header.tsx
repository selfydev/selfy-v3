import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-primary-600">Selfy</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          <Link
            href="/"
            className="text-sm font-semibold leading-6 text-neutral-900 hover:text-primary-600"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-neutral-900 hover:text-primary-600"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
