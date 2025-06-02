import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ContactConfirmationEmailProps {
  name: string;
  message: string;
}

export const ContactConfirmationEmail = ({
  name,
  message,
}: ContactConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for contacting SmartCards Store</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Thank You for Contacting Us</Heading>

        <Text style={text}>Dear {name},</Text>
        <Text style={text}>
          Thank you for reaching out to SmartCards Store. We have received your message
          and will get back to you as soon as possible.
        </Text>
        <Text style={text}>For your records, here&apos;s what you sent us:</Text>

        <Section style={section}>
          <Text style={messageText}>{message}</Text>
        </Section>

        <Text style={text}>
          If you need immediate assistance, please don&apos;t hesitate to reply to this email.
        </Text>
        <Text style={text}>
          Best regards,<br />The SmartCards Store Team
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} SmartCards Store. All rights reserved.
        </Text>
        <Text style={footer}>
          This is an automated response to your contact form submission.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const heading = {
  color: '#4F46E5',
  fontSize: '24px',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  margin: '16px 0',
  fontSize: '16px',
};

const section = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '15px',
  marginBottom: '20px',
};

const messageText = {
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  color: '#666',
  fontSize: '14px',
  margin: '8px 0',
};

export default ContactConfirmationEmail; 