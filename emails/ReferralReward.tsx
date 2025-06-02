import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ReferralRewardEmailProps {
  userName: string
  rewardAmount: number
}

export const ReferralRewardEmail = ({ userName, rewardAmount }: ReferralRewardEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You earned a referral reward!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">Congratulations, {userName}!</Heading>
              <Text className="text-gray-600 mb-6">
                Your friend has made their first purchase using your referral code.
              </Text>
              <Section className="bg-gray-100 p-6 rounded-md text-center mb-6">
                <Text className="font-bold text-lg mb-2">You&apos;ve earned</Text>
                <Text className="font-bold text-3xl text-primary">${rewardAmount.toFixed(2)}</Text>
                <Text className="text-gray-600 mt-2">in referral rewards</Text>
              </Section>
              <Text className="text-gray-600">
                Your reward will be available for your next purchase. Keep sharing your referral code to earn more
                rewards!
              </Text>
              <Text className="text-sm text-gray-500 mt-6">Smart Cards Store</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default ReferralRewardEmail

