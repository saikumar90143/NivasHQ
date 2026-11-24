import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AgentChart from "@/components/agent/AgentChart";

export default async function AgentDashboardPage() {
  const session = await auth();
  
  console.log("[AGENT DASHBOARD] Session:", session);
  
  if (!session || !session.user || (session.user as any).role !== "AGENT") {
    console.log("[AGENT DASHBOARD] Redirecting to / because role is not AGENT", (session?.user as any)?.role);
    redirect("/");
  }

  const userId = session.user.id;

  // Fetch Agent record
  const agent = await db.agent.findUnique({
    where: { userId },
  });

  if (!agent) {
    redirect("/onboarding");
  }

  // Fetch real data
  const totalProperties = await db.property.count({
    where: { ownerId: userId }
  });

  const verifiedProperties = await db.property.count({
    where: { ownerId: userId, verificationStatus: 'VERIFIED' }
  });

  const totalLeads = await db.lead.count({
    where: {
      property: { ownerId: userId }
    }
  });

  // Calculate some mock data for analytics until implemented
  const stats = {
    totalProperties,
    verifiedProperties,
    totalLeads,
    totalSiteVisits: Math.floor(totalLeads * 0.4),
    totalConversions: agent.totalDeals || 0,
    profileViews: 1248 + totalLeads * 3,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agent Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, {agent.companyName || session.user.name}. Here's your performance summary.
          </p>
        </div>
        <Button render={<Link href="/list-property" />} className="bg-[#d4a853] hover:bg-[#d4a853]/90 text-white">
          <Building className="mr-2 h-4 w-4" /> Add New Listing
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#d4a853]/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Listings</CardTitle>
            <Building className="h-4 w-4 text-[#d4a853]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.verifiedProperties} verified
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From your properties
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% since last week
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Site Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalSiteVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalConversions} successful conversions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full pt-4">
              <AgentChart />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start text-left font-normal" render={<Link href="/dashboard/agent/listings" />}>
              Manage My Listings
            </Button>
            <Button variant="outline" className="w-full justify-start text-left font-normal" render={<Link href="/dashboard/agent/leads" />}>
              View New Leads
            </Button>
            <Button variant="outline" className="w-full justify-start text-left font-normal" render={<Link href="/dashboard/agent/settings" />}>
              Update Agent Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
