import Link from 'next/link';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TracksFooter } from '@/components/landing/TracksFooter';
import { DemoTeaser } from '@/components/landing/DemoTeaser';

export default function Home() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Minimal nav */}
      <nav className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur border-b border-ocean/10 py-4 px-4 sm:px-6 flex items-center justify-between">
        <span className="font-display font-bold text-ocean text-xl tracking-tight">
          Voz<span className="text-coral">.</span>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/contacts" className="text-sm text-ocean/50 hover:text-ocean transition-colors">
            Contacts
          </Link>
          <Link
            href="/demo"
            className="text-sm font-semibold bg-coral text-cream px-4 py-2 rounded-lg hover:bg-coral/90 active:scale-[0.97] transition-all"
          >
            Try demo
          </Link>
        </div>
      </nav>

      <Hero />
      <DemoTeaser />
      <HowItWorks />
      <TracksFooter />
    </main>
  );
}
