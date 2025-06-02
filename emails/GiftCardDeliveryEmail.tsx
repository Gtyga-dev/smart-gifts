import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

export interface GiftCardDeliveryEmailProps {
  orderId: string;
  productName: string;
  firstName: string;
  amount: number;
  currency: string;
  redemptionCode: string;
  redemptionInstructions: string;
  pinCode?: string | null;
}

export default function GiftCardDeliveryEmail({
  orderId,
  productName,
  firstName,
  amount,
  currency,
  redemptionCode,
  redemptionInstructions,
  pinCode
}: GiftCardDeliveryEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  const instructionLines = redemptionInstructions.split("\n");

  return (
    <Html>
      <Head />
      <Preview>Your {productName} is ready to use!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Your Gift Card is Ready!</Heading>
          
          <Section style={styles.section}>
            <Text style={styles.text}>
              Hello {firstName},
            </Text>
            <Text style={styles.text}>
              Great news! Your {productName} for {formattedAmount} is ready to use.
              Below you&apos;ll find all the information you need to redeem your gift card.
            </Text>
          </Section>

          <Section style={styles.cardSection}>
            <Heading as="h2" style={styles.cardHeading}>
              {productName}
            </Heading>
            <Text style={styles.cardAmount}>{formattedAmount}</Text>
            
            <Hr style={styles.divider} />
            
            <Text style={styles.redemptionLabel}>Redemption Code:</Text>
            <Text style={styles.redemptionCode}>{redemptionCode}</Text>
            
            {pinCode && (
              <>
                <Text style={styles.redemptionLabel}>PIN Code:</Text>
                <Text style={styles.redemptionCode}>{pinCode}</Text>
              </>
            )}
          </Section>

          <Section style={styles.section}>
            <Heading as="h3" style={styles.instructionsHeading}>
              How to Redeem:
            </Heading>
            <div style={styles.instructionsList}>
              {instructionLines.map((line, index) => (
                <Text key={index} style={styles.instructionItem}>
                  {line}
                </Text>
              ))}
            </div>
          </Section>

          <Section style={styles.section}>
            <Text style={styles.text}>
              If you have any questions or need assistance with your gift card, please
              contact our support team.
            </Text>
            <Button style={styles.button} href={`https://example.com/support?order=${orderId}`}>
              Contact Support
            </Button>
          </Section>

          <Hr style={styles.divider} />
          
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} Smart Cards Store. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              <Link href="https://example.com/terms" style={styles.footerLink}>
                Terms of Service
              </Link>{" "}
              •{" "}
              <Link href="https://example.com/privacy" style={styles.footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "600px",
  },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
    textAlign: "center" as const,
    margin: "30px 0",
  },
  section: {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    marginBottom: "16px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#484848",
    marginBottom: "16px",
  },
  cardSection: {
    padding: "32px 24px",
    backgroundColor: "#f8f7ff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    marginBottom: "24px",
    textAlign: "center" as const,
    border: "1px solid #e9e8ff",
  },
  cardHeading: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#4338ca",
    margin: "0 0 12px",
  },
  cardAmount: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 24px",
  },
  redemptionLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "4px",
    fontWeight: "500",
  },
  redemptionCode: {
    fontSize: "22px",
    fontFamily: "monospace",
    backgroundColor: "#ffffff",
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px dashed #cbd5e1",
    marginBottom: "16px",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  instructionsHeading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "16px",
  },
  instructionsList: {
    margin: "0 0 24px",
  },
  instructionItem: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "8px",
    paddingLeft: "16px",
    position: "relative" as const,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 20px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "24px 0",
  },
  footer: {
    textAlign: "center" as const,
    padding: "0 24px",
  },
  footerText: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#94a3b8",
    margin: "8px 0",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "underline",
  },
};