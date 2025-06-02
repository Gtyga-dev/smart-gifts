import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface OrderApprovedEmailProps {
  orderId: string;
  productNames: string;
}

export const OrderApprovedEmail = ({
  orderId,
  productNames,
}: OrderApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order has been approved</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">
                Order Approved
              </Heading>
              <Text className="text-gray-600 mb-6">
                Your order (ID: {orderId}) has been approved and is now being
                processed. The following products were purchased:
                <strong>{productNames}</strong>.
              </Text>
              <Text className="text-gray-600">
                Thank you for your purchase!
              </Text>
              <Text className="text-sm text-gray-500 mt-6">Smart Cards Store</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderApprovedEmail;
