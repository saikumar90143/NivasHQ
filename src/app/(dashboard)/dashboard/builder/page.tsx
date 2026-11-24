import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BuilderDashboardPage() {
  const session = await auth();
  
  console.log("[BUILDER DASHBOARD] Session:", session);
  
  if (!session || !session.user || (session.user as any).role !== "BUILDER") {
    console.log("[BUILDER DASHBOARD] Redirecting to / because role is not BUILDER", (session?.user as any)?.role);
    redirect("/");
  }

  const userId = session.user.id;

  // Fetch Builder record
  const builder = await db.builder.findUnique({
    where: { userId },
  });

  if (!builder) {
    // If somehow builder record doesn't exist, redirect to onboarding or show error
    redirect("/onboarding");
  }

  // Fetch real data (Currently mock stats since we haven't built project creation yet)
  const stats = {
    totalProjects: 0,
    activeProjects: 0,
    totalUnits: 0,
    totalLeads: 0,
    siteVisits: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Builder Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {builder.companyName}. Here's your portfolio overview.
          </p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-md">
          <Building2 className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-sky-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProjects} currently active
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Units</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Project Inquiries</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Site Visits</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.siteVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <Building2 className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">No projects added yet</p>
              <p className="text-sm text-slate-400 mb-4">Start by adding your first project to the platform.</p>
              <Button variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-center text-slate-500 py-8 border border-slate-100 rounded-md bg-slate-50">
                No inquiries received yet.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
