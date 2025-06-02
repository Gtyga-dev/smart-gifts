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

interface OrderRejectedEmailProps {
  orderId: string;
}

export const OrderRejectedEmail = ({ orderId }: OrderRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order has been rejected</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">
                Order Rejected
              </Heading>
              <Text className="text-gray-600 mb-6">
                We&apos;re sorry, but your order (ID: {orderId}) has been
                rejected.
              </Text>
              <Text className="text-gray-600">
                If you have any questions, please contact our customer support.
              </Text>
              <Text className="text-sm text-gray-500 mt-6">Smart Cards Store</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderRejectedEmail;
