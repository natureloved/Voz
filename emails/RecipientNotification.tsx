import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from '@react-email/components';

interface RecipientNotificationProps {
  senderName: string;
  amount: number;
  claimUrl: string;
  recipientLanguage: 'en' | 'es';
}

export default function RecipientNotification({
  senderName,
  amount,
  claimUrl,
  recipientLanguage,
}: RecipientNotificationProps) {
  const isEs = recipientLanguage === 'es';

  return (
    <Html lang={recipientLanguage}>
      <Head />
      <Preview>
        {isEs
          ? `${senderName} te envió $${amount} USDC`
          : `${senderName} sent you $${amount} USDC`}
      </Preview>
      <Body style={{ backgroundColor: '#FBF7EF', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        {/* Header band */}
        <Section style={{ backgroundColor: '#0A2540', padding: '20px 32px' }}>
          <Text style={{ color: '#FBF7EF', fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
            Voz
          </Text>
        </Section>

        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 32px' }}>
          {/* Amount */}
          <Section style={{ textAlign: 'center', padding: '32px 0' }}>
            <Text style={{ fontSize: '64px', fontWeight: 700, color: '#0A2540', margin: 0, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
              ${amount}
            </Text>
            <Text style={{ fontSize: '14px', color: '#0A2540', opacity: 0.4, margin: '4px 0 0', fontFamily: 'monospace' }}>
              USDC
            </Text>
          </Section>

          {/* Sender name */}
          <Text style={{ fontSize: '22px', color: '#FF6B5C', fontWeight: 600, textAlign: 'center', margin: '0 0 32px' }}>
            {isEs ? `${senderName} te envió un mensaje` : `${senderName} sent you a message`}
          </Text>

          <Hr style={{ borderColor: '#0A2540', opacity: 0.1, margin: '0 0 32px' }} />

          {/* CTA */}
          <Section style={{ textAlign: 'center' }}>
            <Button
              href={claimUrl}
              style={{
                backgroundColor: '#FF6B5C',
                color: '#FBF7EF',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {isEs ? 'Escuchar mi mensaje' : 'Listen to your message'}
            </Button>
          </Section>

          <Hr style={{ borderColor: '#0A2540', opacity: 0.1, margin: '40px 0 24px' }} />

          {/* Footer */}
          <Text style={{ fontSize: '11px', color: '#0A2540', opacity: 0.4, textAlign: 'center', margin: 0 }}>
            {isEs
              ? 'Este correo fue enviado por Voz, pagos de voz entre cadenas.'
              : 'This email was sent by Voz, cross-chain voice payments.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
