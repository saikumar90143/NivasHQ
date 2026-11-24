import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, CreditCard, Activity, ArrowUpRight } from "lucide-react"
import AdminChart from "@/components/admin/AdminChart"

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Properties" value="12,450" change="+12%" icon={Building} />
        <MetricCard title="Active Agents" value="842" change="+5%" icon={Users} />
        <MetricCard title="Monthly Revenue" value="₹4.2L" change="+18%" icon={CreditCard} />
        <MetricCard title="Active Leads" value="3,205" change="+24%" icon={Activity} />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <AdminChart />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                    <Users className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Agent {i}</p>
                    <p className="text-sm text-muted-foreground">agent{i}@example.com</p>
                  </div>
                  <div className="text-sm font-medium text-emerald-600">
                    Just now
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon }: { title: string, value: string, change: string, icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500 font-medium">{change}</span> from last month
        </p>
      </CardContent>
    </Card>
  )
}
