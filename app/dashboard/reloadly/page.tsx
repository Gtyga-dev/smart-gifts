import { ReloadlySync } from "@/app/components/dashboard/ReloadlySync"

export const metadata = {
    title: "Reloadly Sync | Dashboard",
    description: "Manage your Reloadly integration and sync products",
}

export default function ReloadlySyncPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Reloadly Integration</h1>
                <p className="text-muted-foreground">
                    Manage your Reloadly integration, sync products, and check your balance.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <ReloadlySync />
            </div>
        </div>
    )
}
