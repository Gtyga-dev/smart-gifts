import { CreateP2PListing } from "@/app/components/p2p/CreateP2pListing"

export const metadata = {
    title: "Create P2P Listing",
    description: "Create a new P2P listing to sell crypto, gift cards, or forex",
}

export default function CreateP2PListingPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Create P2P Listing</h1>
            <CreateP2PListing />
        </div>
    )
}
