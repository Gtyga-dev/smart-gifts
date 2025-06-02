import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ListingSubmittedEmailProps {
    listingId: string
    assetName: string
    firstName: string
}

export default function ListingSubmittedEmail({ listingId, assetName, firstName }: ListingSubmittedEmailProps) {
    const previewText = `Your P2P listing for ${assetName} has been submitted`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="bg-white p-8 rounded-lg shadow-lg my-10 mx-auto max-w-md">
                        <Img
                            src="https://smartcards.store/tlogo.png"
                            alt="Smart Cards Logo"
                            width="150"
                            height="40"
                            className="mx-auto mb-6"
                        />
                        <Heading className="text-xl font-bold text-center text-gray-800 mb-6">P2P Listing Submitted</Heading>
                        <Section>
                            <Text className="text-gray-700 mb-4">Hello {firstName},</Text>
                            <Text className="text-gray-700 mb-4">
                                Thank you for submitting your P2P listing for <strong>{assetName}</strong>. Your listing is currently
                                under review by our team.
                            </Text>
                            <Text className="text-gray-700 mb-4">
                                You will receive another email once your listing is approved and published on the marketplace. This
                                usually takes less than 24 hours.
                            </Text>
                            <Text className="text-gray-700 mb-4">
                                Listing ID: <span className="font-mono text-sm">{listingId}</span>
                            </Text>
                        </Section>
                        <Section className="text-center mt-8">
                            <Link
                                href={`https://smartcards.store/p2p`}
                                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg no-underline"
                            >
                                View P2P Marketplace
                            </Link>
                        </Section>
                        <Text className="text-gray-500 text-sm text-center mt-8">
                            © {new Date().getFullYear()} Smart Cards. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
