import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Link } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ReferralInviteEmailProps {
  referrerName: string
  referralCode: string
  referralUrl: string
  refereeReward: number
}

export const ReferralInviteEmail = ({
  referrerName,
  referralCode,
  referralUrl,
  refereeReward,
}: ReferralInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{referrerName} invited you to Smart Cards Gift Cards</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">You&apos;ve been invited!</Heading>
              <Text className="text-gray-600 mb-6">
                {referrerName} thinks you&apos;ll love Smart Cards Gift Cards, the premier marketplace for gift cards.
              </Text>
              <Text className="text-gray-600 mb-6">
                Sign up using their referral code and get ${refereeReward.toFixed(2)} off your first purchase!
              </Text>
              <Section className="bg-gray-100 p-4 rounded-md text-center mb-6">
                <Text className="font-bold text-lg">Your Referral Code</Text>
                <Text className="font-mono text-xl bg-white p-2 rounded border border-gray-300 inline-block">
                  {referralCode}
                </Text>
              </Section>
              <Section className="text-center">
                <Button href={referralUrl} className="bg-primary text-white font-bold px-6 py-3 rounded-md">
                  Sign Up Now
                </Button>
              </Section>
              <Text className="text-sm text-gray-500 mt-6">
                Or copy this link: <Link href={referralUrl}>{referralUrl}</Link>
              </Text>
              <Text className="text-sm text-gray-500 mt-6">Smart Cards Store</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default ReferralInviteEmail

