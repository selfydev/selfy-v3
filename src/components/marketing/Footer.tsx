import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Selfy v3</h3>
            <p className="mt-4 text-sm text-neutral-600">
              Modern web application built with Next.js 15, TypeScript, and Tailwind CSS.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-neutral-600 hover:text-primary-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-neutral-600 hover:text-primary-600">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-neutral-600 hover:text-primary-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-neutral-600 hover:text-primary-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Selfy. All rights reserved. Sprint 1
          </p>
        </div>
      </div>
    </footer>
  );
}
