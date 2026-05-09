import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { resend, FROM_ADDRESS } from '@/lib/resend';
import RecipientNotification from '@/emails/RecipientNotification';
import SenderConfirmation from '@/emails/SenderConfirmation';
import React from 'react';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      transferId,
      amount,
      senderName,
      senderEmail,
      senderLanguage,
      recipientName,
      recipientEmail,
      recipientLanguage,
      txHash,
      claimUrl,
    } = body;

    if (!transferId || !amount || !claimUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
