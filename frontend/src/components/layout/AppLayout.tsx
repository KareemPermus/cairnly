import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiFolder, FiMenu, FiX } from 'react-icons/fi';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/projects', label: 'Projects', icon: FiFolder },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const path = router?.pathname || '';

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold" style={{ background: 'var(--gradient-header-primary)' }}>C</div>
        <span className="text-lg font-bold text-ink">Cairnly</span>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-canvas hover:text-ink'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="m-3 flex items-center gap-3 rounded-xl bg-accent-soft p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">PM</div>
        <div>
          <p className="text-sm font-semibold text-ink">Project Manager</p>
          <p className="text-xs text-muted">Workspace</p>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-white md:block">{nav}</aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
        <span className="font-bold text-ink">Cairnly</span>
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-canvas"><FiMenu size={20} /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div data-testid="backdrop" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-lg p-1 hover:bg-canvas"><FiX size={18} /></button>
            {nav}
          </aside>
        </div>
      )}
      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}