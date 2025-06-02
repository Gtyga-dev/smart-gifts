import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ListingApprovedEmailProps {
    listingId: string
    assetName: string
    firstName: string
}

export default function ListingApprovedEmail({ listingId, assetName, firstName }: ListingApprovedEmailProps) {
    const previewText = `Your P2P listing for ${assetName} has been approved`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans">
                    <Container className="bg-white p-8 rounded-lg shadow-lg my-10 mx-auto max-w-md">
                        <Img
                            src="https://smartcards.store/tlogo.png"
                            alt="SmartCards Logo"
                            width="150"
                            height="40"
                            className="mx-auto mb-6"
                        />
                        <Heading className="text-xl font-bold text-center text-gray-800 mb-6">P2P Listing Approved</Heading>
                        <Section>
                            <Text className="text-gray-700 mb-4">Hello {firstName},</Text>
                            <Text className="text-gray-700 mb-4">
                                Great news! Your P2P listing for <strong>{assetName}</strong> has been approved and is now live on the
                                marketplace.
                            </Text>
                            <Text className="text-gray-700 mb-4">
                                Your listing is now visible to all users and you may start receiving offers. You&apos;ll be notified when
                                someone makes an offer on your listing.
                            </Text>
                            <Text className="text-gray-700 mb-4">
                                Listing ID: <span className="font-mono text-sm">{listingId}</span>
                            </Text>
                        </Section>
                        <Section className="text-center mt-8">
                            <Link
                                href={`https://smartcards.store/p2p/${listingId}`}
                                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg no-underline"
                            >
                                View Your Listing
                            </Link>
                        </Section>
                        <Text className="text-gray-500 text-sm text-center mt-8">
                            © {new Date().getFullYear()} SmartCards. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
