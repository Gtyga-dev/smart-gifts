import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

interface AdminAlertEmailProps {
  orderId: string;
  userEmail: string;
}

const AdminAlertEmail = ({ orderId, userEmail }: AdminAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>New Gift Card Order</Preview>
    <Body style={{ fontFamily: "Arial, sans-serif" }}>
      <Container>
        <Heading>New Gift Card Order</Heading>
        <Text>Order ID: {orderId}</Text>
        <Text>User Email: {userEmail}</Text>
        <Text>Please process this order as soon as possible.</Text>
      </Container>
    </Body>
  </Html>
);

export default AdminAlertEmail;
