'use client';

import * as React from 'react';
import { PaymentIntent } from '@/lib/intent-schema';
import type { Contact } from '@/lib/contacts';
import { IntentReview } from './IntentReview';

interface StepReviewProps {
  intent: PaymentIntent;
  onConfirm: (intent: PaymentIntent, resolvedContact?: Contact) => void;
}

export function StepReview({ intent, onConfirm }: StepReviewProps) {
  return (
    <div className="py-8 sm:py-12">
      <IntentReview intent={intent} onConfirm={onConfirm} />
    </div>
  );
}
