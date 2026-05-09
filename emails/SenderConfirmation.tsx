import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';

interface SenderConfirmationProps {
  recipientName?: string;
  amount: number;
  txHash: string;
  claimUrl: string;
  senderLanguage: 'en' | 'es';
}

export default function SenderConfirmation({
  recipientName,
  amount,
  txHash,
  claimUrl,
  senderLanguage,
}: SenderConfirmationProps) {
  const isEs = senderLanguage === 'es';
  const to = recipientName ?? (isEs ? 'el destinatario' : 'the recipient');

  return (
    <Html lang={senderLanguage}>
      <Head />
      <Preview>
        {isEs ? `Enviaste $${amount} USDC a ${to}` : `You sent $${amount} USDC to ${to}`}
      </Preview>
      <Body style={{ backgroundColor: '#FBF7EF', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: '#0A2540', padding: '20px 32px' }}>
          <Text style={{ color: '#FBF7EF', fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
            Voz
          </Text>
        </Section>

        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 32px' }}>
          <Text style={{ fontSize: '28px', fontWeight: 700, color: '#0A2540', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {isEs ? '¡Enviado!' : 'Sent!'}
          </Text>
          <Text style={{ fontSize: '16px', color: '#0A2540', opacity: 0.6, margin: '0 0 32px' }}>
            {isEs
              ? `$${amount} USDC a ${to} está en camino.`
              : `$${amount} USDC to ${to} is on its way.`}
          </Text>

          <Hr style={{ borderColor: '#0A2540', opacity: 0.1, margin: '0 0 24px' }} />

          <Text style={{ fontSize: '11px', fontWeight: 600, color: '#0A2540', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
            {isEs ? 'Hash de transacción' : 'Transaction hash'}
          </Text>
          <Text style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0A2540', opacity: 0.7, margin: '0 0 32px', wordBreak: 'break-all' }}>
            {txHash}
          </Text>

          <Section style={{ display: 'flex', gap: '12px' }}>
            <Button
              href={claimUrl}
              style={{
                backgroundColor: '#0A2540',
                color: '#FBF7EF',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '12px',
              }}
            >
              {isEs ? 'Ver enlace de claim' : 'View claim link'}
            </Button>
            <Button
              href={`https://solscan.io/tx/${txHash}`}
              style={{
                backgroundColor: 'transparent',
                color: '#0A2540',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                border: '1px solid rgba(10,37,64,0.2)',
              }}
            >
              Solscan ↗
            </Button>
          </Section>

          <Hr style={{ borderColor: '#0A2540', opacity: 0.1, margin: '40px 0 24px' }} />

          <Text style={{ fontSize: '11px', color: '#0A2540', opacity: 0.4, textAlign: 'center', margin: 0 }}>
            {isEs ? 'Voz — pagos de voz entre cadenas.' : 'Voz — cross-chain voice payments.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
