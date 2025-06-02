import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  message: string;
}

export const ContactNotificationEmail = ({
  name,
  email,
  message,
}: ContactNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New Contact Form Submission from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New Contact Form Submission</Heading>
        <Text style={dateText}>Received on {new Date().toLocaleDateString()}</Text>

        <Section style={section}>
          <Heading as="h2" style={subheading}>Contact Details</Heading>
          <Text style={text}>Name: {name}</Text>
          <Text style={text}>Email: <Link href={`mailto:${email}`}>{email}</Link></Text>
        </Section>

        <Section style={section}>
          <Heading as="h2" style={subheading}>Message</Heading>
          <Text style={text}>{message}</Text>
        </Section>

        <Text style={footer}>
          This is an automated message from your website&apos;s contact form.
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} Smart Cards Store. All rights reserved.
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

const dateText = {
  color: '#666',
  textAlign: 'center' as const,
};

const section = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '15px',
  marginBottom: '20px',
};

const subheading = {
  color: '#4F46E5',
  fontSize: '20px',
  margin: '0 0 15px 0',
};

const text = {
  margin: '5px 0',
  fontSize: '16px',
};

const footer = {
  textAlign: 'center' as const,
  color: '#666',
  fontSize: '14px',
};

export default ContactNotificationEmail; 