'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HowItWorks() {
  return (
    <section className="py-14 sm:py-24 px-6 bg-cream overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-coral text-sm font-bold uppercase tracking-widest mb-3">
            How Voz. works
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ocean font-bold">
            One person speaks. The other hears.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sender card */}
          <motion.div
            className="bg-white border border-ocean/10 rounded-2xl p-8 hover:border-ocean/20 transition-all flex flex-col justify-between"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -4, boxShadow: '0 12px 30px -10px rgba(10, 37, 64, 0.08)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-coral text-cream
                                flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-display text-2xl text-ocean font-bold">You send</h3>
              </div>
              <ol className="space-y-4 text-ocean/80 list-decimal pl-5 marker:text-coral marker:font-bold">
                <li><strong className="text-ocean">Connect</strong> your wallet - Base, Arbitrum, Optimism, or Polygon</li>
                <li><strong className="text-ocean">Speak</strong> what you want to send: <em className="text-ocean/70">"Send fifty dollars to Maria for her birthday"</em></li>
                <li><strong className="text-ocean">Confirm</strong> the amount and recipient</li>
                <li><strong className="text-ocean">Approve</strong> the transaction - Voz. bridges to Solana automatically</li>
                <li><strong className="text-ocean">Share</strong> the claim link by email or copy it to send via WhatsApp, Telegram, or text</li>
              </ol>
            </div>
          </motion.div>

          {/* Recipient card */}
          <motion.div
            className="bg-white border border-gold/30 rounded-2xl p-8 hover:border-gold/50 transition-all flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -4, boxShadow: '0 12px 30px -10px rgba(245, 200, 66, 0.12)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold text-ocean
                                flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-display text-2xl text-ocean font-bold">They receive</h3>
              </div>
              <ol className="space-y-4 text-ocean/80 list-decimal pl-5 marker:text-gold marker:font-bold">
                <li><strong className="text-ocean">Open</strong> the claim link on any phone</li>
                <li><strong className="text-ocean">Hear</strong> your message in their language</li>
                <li><strong className="text-ocean">Receive</strong> USDC straight into their Solana wallet</li>
              </ol>
            </div>
            <p className="mt-8 text-coral italic text-sm font-medium">
              No app to download. No wallet to connect.
            </p>
          </motion.div>
        </div>

        {/* CTA win */}
        <motion.div
          className="mt-10 sm:mt-20 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-xl font-display text-ocean font-medium">
            Ready to try it?
          </p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link
              href="/demo"
              className="inline-flex items-center justify-center bg-coral text-cream px-8 py-3.5 rounded-xl font-semibold shadow-md shadow-coral/10 hover:bg-coral/95 transition-colors text-base"
            >
              Try the demo &rarr;
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

