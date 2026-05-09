'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TracksFooter } from '@/components/landing/TracksFooter';
import { DemoTeaser } from '@/components/landing/DemoTeaser';
import { EvmConnectButton } from '@/components/wallet/EvmConnectButton';
import { SolanaConnectButton } from '@/components/wallet/SolanaConnectButton';

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Minimal nav */}
      <nav className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur border-b border-ocean/10 py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-ocean text-xl tracking-tight hover:opacity-90 transition-opacity">
            Voz<span className="text-coral">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contacts" className="text-sm text-ocean/50 hover:text-ocean transition-colors">
              Contacts
            </Link>
            <div className="flex items-center gap-2">
              <EvmConnectButton />
              <SolanaConnectButton />
            </div>
            <Link
              href="/demo"
              className="text-sm font-semibold bg-coral text-cream px-4 py-2 rounded-lg hover:bg-coral/90 active:scale-[0.97] transition-all"
            >
              Try demo
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ocean hover:text-ocean/80 focus:outline-none p-1.5 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-ocean/5 mt-3"
            >
              <div className="flex flex-col gap-4 py-4 px-1">
                <Link
                  href="/contacts"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-ocean/70 hover:text-ocean py-2 transition-colors border-b border-ocean/5"
                >
                  Contacts
                </Link>
                <div className="flex flex-col gap-3 py-2">
                  <div className="w-full flex justify-start">
                    <EvmConnectButton />
                  </div>
                  <div className="w-full flex justify-start">
                    <SolanaConnectButton />
                  </div>
                </div>
                <Link
                  href="/demo"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-semibold bg-coral text-cream px-4 py-3 rounded-xl hover:bg-coral/90 active:scale-[0.97] transition-all shadow-md shadow-coral/10"
                >
                  Try demo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Hero />
      <DemoTeaser />
      <HowItWorks />
      <TracksFooter />
    </main>
  );
}

export const dynamic = 'force-dynamic';
