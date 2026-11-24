import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function AgentSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const agent = await db.agent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agent Profile Settings</h2>
        <p className="text-muted-foreground">Update your public agent profile and contact details.</p>
      </div>

      <form className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none">Company Name</label>
            <Input defaultValue={agent.companyName || ''} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium leading-none">License Number / RERA ID</label>
            <Input defaultValue={agent.licenseNumber || ''} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium leading-none">Specializations</label>
            <Input defaultValue={agent.specializations?.join(', ') || ''} placeholder="e.g. Commercial, Residential" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium leading-none">Professional Bio</label>
            <Textarea defaultValue={agent.bio || ''} placeholder="Write a short bio about your experience..." className="mt-2 h-32" />
          </div>
        </div>
        
        <Button className="w-full bg-[#d4a853] hover:bg-[#d4a853]/90 text-white">Save Changes</Button>
      </form>
    </div>
  );
}
