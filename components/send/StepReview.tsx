'use client';

import * as React from 'react';
import { PaymentIntent } from '@/lib/intent-schema';
import type { Contact } from '@/lib/contacts';
import { IntentReview } from './IntentReview';

interface StepReviewProps {
  intent: PaymentIntent;
  onConfirm: (intent: PaymentIntent, resolvedContact?: Contact) => void;
  onBack?: () => void;
}

export function StepReview({ intent, onConfirm, onBack }: StepReviewProps) {
  return (
    <div className="py-8 sm:py-12">
      <IntentReview intent={intent} onConfirm={onConfirm} onBack={onBack} />
    </div>
  );
}
