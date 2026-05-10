'use client';

import * as React from 'react';
import { SupportedCurrency } from '@/lib/fx';

interface Partner {
  name: string;
  category: string;
  tagline: string;
  bg: string;
  fg: string;
  abbr: string;
}

const REGION: Record<SupportedCurrency, string> = {
  USD: 'the United States',
  MXN: 'Mexico',
  COP: 'Colombia',
  NGN: 'Nigeria',
};

const PARTNERS: Record<SupportedCurrency, Partner[]> = {
  USD: [
    { name: 'Chase Bank',   category: 'ACH Transfer',    tagline: 'Same-day to any US account',      bg: '#003087', fg: '#fff',     abbr: 'CH' },
    { name: 'Zelle',        category: 'Peer-to-Peer',    tagline: 'Instant via phone number',         bg: '#6D1ED4', fg: '#fff',     abbr: 'Z'  },
    { name: 'Venmo',        category: 'Digital Wallet',  tagline: 'Cash out in minutes',              bg: '#3D95CE', fg: '#fff',     abbr: 'V'  },
    { name: 'Wells Fargo',  category: 'ATM Access',      tagline: '13,000+ ATMs coast-to-coast',      bg: '#CC0000', fg: '#fff',     abbr: 'WF' },
  ],
  MXN: [
    { name: 'OXXO',         category: 'Cash Pickup',     tagline: '20,000+ tiendas en México',        bg: '#E8002D', fg: '#fff',     abbr: 'OXXO' },
    { name: 'BBVA México',  category: 'Bank Deposit',    tagline: 'Directo a tu cuenta BBVA',         bg: '#004481', fg: '#fff',     abbr: 'BB'   },
    { name: 'Coppel',       category: 'Retail Cash Out', tagline: 'Disponible en todos los estados',  bg: '#F97316', fg: '#fff',     abbr: 'CP'   },
    { name: 'Santander MX', category: 'Bank Transfer',   tagline: 'Depósito inmediato en MXN',        bg: '#EC0000', fg: '#fff',     abbr: 'SAN'  },
  ],
  COP: [
    { name: 'Bancolombia',  category: 'Bank Deposit',    tagline: 'Red más grande de Colombia',       bg: '#FDB913', fg: '#1A1A1A', abbr: 'BC' },
    { name: 'Efecty',       category: 'Cash Pickup',     tagline: '+10,000 puntos de pago',           bg: '#FF6B00', fg: '#fff',     abbr: 'EF' },
    { name: 'Nequi',        category: 'Mobile Wallet',   tagline: 'Transferencia desde la app',       bg: '#7B2D8B', fg: '#fff',     abbr: 'NQ' },
    { name: 'Davivienda',   category: 'Bank Transfer',   tagline: 'Cajeros y sucursales',             bg: '#DA251D', fg: '#fff',     abbr: 'DV' },
  ],
  NGN: [
    { name: 'OPay',         category: 'Mobile Money',    tagline: 'Instant NGN wallet top-up',        bg: '#1AA260', fg: '#fff',     abbr: 'OP' },
    { name: 'GTBank',       category: 'Bank Deposit',    tagline: 'Transfer to any GTB account',      bg: '#F58220', fg: '#fff',     abbr: 'GT' },
    { name: 'PalmPay',      category: 'Digital Wallet',  tagline: 'Zero-fee local transfers',         bg: '#00A651', fg: '#fff',     abbr: 'PP' },
    { name: 'First Bank',   category: 'Bank & ATM',      tagline: '700+ branches nationwide',         bg: '#003C8F', fg: '#fff',     abbr: 'FB' },
  ],
};

export function LocalCashOut({ currency }: { currency: SupportedCurrency }) {
  const [visible, setVisible] = React.useState(true);
  const [shown, setShown] = React.useState(currency);

  React.useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setShown(currency);
      setVisible(true);
    }, 140);
    return () => clearTimeout(t);
  }, [currency]);

  const partners = PARTNERS[shown];

  return (
    <div className="w-full bg-ocean/5 rounded-2xl p-4 sm:p-6 space-y-4">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-coral/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M7.5 1C4.967 1 2.917 3.05 2.917 5.583c0 3.563 4.583 8.417 4.583 8.417s4.583-4.854 4.583-8.417C12.083 3.05 10.033 1 7.5 1z"
              fill="#FF6B5C"
              fillOpacity="0.65"
            />
            <circle cx="7.5" cy="5.583" r="1.583" fill="#FF6B5C" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-ocean/40 uppercase tracking-wider leading-none">
            How to use your funds
          </p>
          <p
            className="text-sm font-medium text-ocean/70 mt-1 transition-opacity duration-150"
            style={{ opacity: visible ? 1 : 0 }}
          >
            Cash-out partners in {REGION[shown]}
          </p>
        </div>
      </div>

      {/* Partner cards grid */}
      <div
        className="grid grid-cols-2 gap-2.5 transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {partners.map((p) => (
          <div
            key={p.name}
            className="bg-white rounded-xl p-3 flex flex-col gap-2 border border-ocean/[0.06] hover:border-ocean/20 hover:shadow-md transition-all duration-200 group"
          >
            {/* Brand badge */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wide leading-none select-none flex-shrink-0"
              style={{ backgroundColor: p.bg, color: p.fg }}
            >
              {p.abbr}
            </div>

            {/* Name + category */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-ocean leading-tight">
                {p.name}
              </p>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-ocean/[0.06] text-[9px] font-semibold text-ocean/50 uppercase tracking-wide">
                {p.category}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-[10px] text-ocean/50 leading-snug mt-auto">
              {p.tagline}
            </p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-center gap-1.5">
        <span className="block w-8 h-px bg-ocean/10" />
        <p className="text-[9px] text-ocean/25 tracking-wide text-center">
          Partner network · Integrations coming soon
        </p>
        <span className="block w-8 h-px bg-ocean/10" />
      </div>
    </div>
  );
}
