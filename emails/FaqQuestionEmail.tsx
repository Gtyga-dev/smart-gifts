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
import { Tailwind } from '@react-email/tailwind';

interface FaqQuestionEmailProps {
  question: string;
}

export const FaqQuestionEmail = ({ question }: FaqQuestionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New FAQ Question Submitted</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">
                New FAQ Question
              </Heading>
              <Text className="text-gray-600 mb-6">
                A new question has been submitted through the FAQ page:
              </Text>
              <Section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Text className="text-gray-800 font-medium">{question}</Text>
              </Section>
              <Text className="text-sm text-gray-500 mt-6">
                Received from Smart Cards FAQ Page
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FaqQuestionEmail; 