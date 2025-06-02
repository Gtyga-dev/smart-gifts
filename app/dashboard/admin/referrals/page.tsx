import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getReferralPrograms, getReferralStats } from "@/app/actions/referral";
import { ReferralProgramForm } from "./components/referral-program-form";
import { ReferralProgramList } from "./components/referral-program-list";
import { ReferralDashboard } from "./components/referral-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';


export default async function AdminReferralsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  // TODO: Add proper admin check here
  // This is a placeholder - implement your own admin check
  const isAdmin = true;
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const programs = await getReferralPrograms();
  const stats = await getReferralStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Referral Program Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage your store&apos;s referral program
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="new">Create Program</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6 pt-4">
          <ReferralDashboard stats={stats} />
        </TabsContent>
        <TabsContent value="programs" className="space-y-6 pt-4">
          <ReferralProgramList programs={programs} />
        </TabsContent>
        <TabsContent value="new" className="space-y-6 pt-4">
          <ReferralProgramForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
