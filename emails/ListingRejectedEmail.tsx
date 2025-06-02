import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ListingRejectedEmailProps {
    listingId: string
    assetName: string
    firstName: string
}

export default function ListingRejectedEmail({ listingId, assetName, firstName }: ListingRejectedEmailProps) {
    const previewText = `Your P2P listing for ${assetName} has been rejected`

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
                        <Heading className="text-xl font-bold text-center text-gray-800 mb-6">P2P Listing Rejected</Heading>
                        <Section>
                            <Text className="text-gray-700 mb-4">Hello {firstName},</Text>
                            <Text className="text-gray-700 mb-4">
                                We regret to inform you that your P2P listing for <strong>{assetName}</strong> has been rejected.
                            </Text>
                            <Text className="text-gray-700 mb-4">This may be due to one of the following reasons:</Text>
                            <ul className="list-disc pl-6 mb-4 text-gray-700">
                                <li>The listing doesn&apos;t comply with our terms of service</li>
                                <li>Insufficient or unclear information provided</li>
                                <li>Prohibited items or services</li>
                                <li>Pricing issues or concerns</li>
                            </ul>
                            <Text className="text-gray-700 mb-4">
                                You can create a new listing that addresses these issues. If you believe this was a mistake, please
                                contact our support team.
                            </Text>
                            <Text className="text-gray-700 mb-4">
                                Listing ID: <span className="font-mono text-sm">{listingId}</span>
                            </Text>
                        </Section>
                        <Section className="text-center mt-8">
                            <Link
                                href={`https://smartcards.store/p2p/create`}
                                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg no-underline"
                            >
                                Create New Listing
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
