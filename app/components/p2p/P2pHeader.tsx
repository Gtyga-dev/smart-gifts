"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

interface P2PHeaderProps {
    onFilterChange?: (filters: { tradeType: string; assetType: string }) => void
}

export function P2PHeader({ onFilterChange }: P2PHeaderProps = {}) {
    const [tradeType, setTradeType] = useState("buy")
    const [assetType, setAssetType] = useState("all")

    // Update parent component when filters change
    useEffect(() => {
        onFilterChange?.({ tradeType, assetType })
    }, [tradeType, assetType, onFilterChange])

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">P2P Trading</h1>
                    <p className="text-muted-foreground mt-1">
                        Buy and sell crypto, gift cards, and forex directly with other users
                    </p>
                </div>
                <Button asChild className="flex items-center gap-2">
                    <Link href="/p2p/create">
                        <Plus className="h-4 w-4" />
                        Create Listing
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex flex-col md:flex-row gap-4">
                    <Tabs defaultValue="buy" className="w-full md:w-auto" onValueChange={(value) => setTradeType(value)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="buy">Buy</TabsTrigger>
                            <TabsTrigger value="sell">Sell</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Select defaultValue="all" onValueChange={(value) => setAssetType(value)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Asset Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Assets</SelectItem>
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                            <SelectItem value="giftcard">Gift Cards</SelectItem>
                            <SelectItem value="forex">Forex</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, payment method, or user..." className="pl-10 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
