'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Mic } from 'lucide-react';

export function DemoTeaser() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-14 flex justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-ocean/5 rounded-3xl blur-3xl" />
        
        <motion.div 
          className="relative bg-white border border-ocean/10 rounded-3xl p-6 md:p-10 shadow-xl shadow-ocean/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start">
            
            {/* Left: Speech Input Simulation */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-ocean/50 font-medium text-sm">
                <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                  <Mic size={16} />
                </div>
                Processing voice input...
              </div>
              
              <div className="bg-ocean/5 rounded-2xl p-4 text-ocean font-mono text-sm leading-relaxed min-h-[100px]">
                <Typewriter text="Send $25 to Maria for her birthday. Hope you have a great one!" delay={0.5} />
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 3 }}
                className="flex items-center gap-2 text-xs font-semibold text-ocean/40 uppercase tracking-wider"
              >
                <Check size={14} className="text-gold" />
                Parsed intent via Anthropic
              </motion.div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-ocean/10 self-stretch mx-4" />

            {/* Right: Parsed Output */}
            <div className="w-full md:w-1/2 flex flex-col gap-6 pt-2 md:pt-0">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 3.5, duration: 0.5 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold text-ocean/30 uppercase tracking-widest block mb-1">Transfer</span>
                  <div className="text-2xl font-mono font-bold text-ocean">25.00 USDC</div>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-ocean/30 uppercase tracking-widest block mb-1">Recipient</span>
                  <div className="flex items-center gap-2 bg-ocean/5 rounded-lg px-3 py-2 w-fit">
                    <div className="w-5 h-5 rounded-full bg-ocean flex items-center justify-center text-[9px] font-bold text-cream">M</div>
                    <span className="text-sm font-semibold text-ocean">Maria Garcia</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-ocean/30 uppercase tracking-widest block mb-1">Translated Audio Payload</span>
                  <div className="flex items-center gap-2 text-sm text-ocean/70 italic">
                    "Envía $25 a María..."
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Typewriter({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = React.useState('');

  React.useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.substring(0, i));
        i++;
        if (i > text.length) {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayed}
      <motion.span 
        animate={{ opacity: [1, 0] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        |
      </motion.span>
    </span>
  );
}
