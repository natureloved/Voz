import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { resend, FROM_ADDRESS } from '@/lib/resend';
import RecipientNotification from '@/emails/RecipientNotification';
import SenderConfirmation from '@/emails/SenderConfirmation';
import React from 'react';
import { getTransfer } from '@/lib/transfers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      transferId,
      senderEmail,
      senderLanguage,
      recipientEmail,
    } = body;

    let {
      amount,
      senderName,
      recipientName,
      recipientLanguage,
      txHash,
      claimUrl,
    } = body;

    if (!transferId) {
      return NextResponse.json({ error: 'Missing transferId' }, { status: 400 });
    }

    // Try to load from database if fields are missing
    if (!amount || !claimUrl) {
      const transfer = await getTransfer(transferId);
      if (transfer) {
        amount = amount ?? transfer.amount;
        recipientName = recipientName ?? transfer.recipientName;
        recipientLanguage = recipientLanguage ?? transfer.recipientLanguage;
        txHash = txHash ?? transfer.txHash;
        claimUrl = claimUrl ?? `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/claim/${transferId}`;
        senderName = senderName ?? transfer.senderName;
      }
    }

    if (!amount || !claimUrl) {
      return NextResponse.json({ error: 'Missing required transfer fields' }, { status: 400 });
    }

    const sends: Promise<unknown>[] = [];

    // Recipient email
    if (recipientEmail) {
      const subject = recipientLanguage === 'es'
        ? `${senderName ?? 'Alguien'} te envió $${amount} USDC`
        : `${senderName ?? 'Someone'} sent you $${amount} USDC`;

      const html = await render(
        React.createElement(RecipientNotification, {
          senderName: senderName ?? 'Someone',
          amount,
          claimUrl,
          recipientLanguage: recipientLanguage ?? 'en',
        })
      );

      sends.push(
        resend.emails.send({
          from: FROM_ADDRESS,
          to: recipientEmail,
          subject,
          html,
        })
      );
    }

    // Sender confirmation email
    if (senderEmail) {
      const subject = senderLanguage === 'es'
        ? `Enviaste $${amount} USDC${recipientName ? ` a ${recipientName}` : ''}`
        : `You sent $${amount} USDC${recipientName ? ` to ${recipientName}` : ''}`;

      const html = await render(
        React.createElement(SenderConfirmation, {
          recipientName,
          amount,
          txHash: txHash ?? '',
          claimUrl,
          senderLanguage: senderLanguage ?? 'en',
        })
      );

      sends.push(
        resend.emails.send({
          from: FROM_ADDRESS,
          to: senderEmail,
          subject,
          html,
        })
      );
    }

    await Promise.allSettled(sends);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('send-claim email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
