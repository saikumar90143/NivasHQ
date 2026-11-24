import { Building2, LayoutDashboard, Users, UserCheck, Settings, LineChart, FileText, Building, CreditCard } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-slate-900 text-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold tracking-tight">Nivasa<span className="text-yellow-500">HQ</span> Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">Super Admin</div>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              A
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 container flex gap-6 py-6">
        <aside className="w-64 shrink-0 hidden md:block">
          <nav className="flex flex-col gap-1 sticky top-24">
            <NavItem href="/admin" icon={LayoutDashboard} label="Overview" exact />
            <NavItem href="/admin/properties" icon={Building} label="Properties" />
            <NavItem href="/admin/agents" icon={UserCheck} label="Agent Verification" />
            <NavItem href="/admin/users" icon={Users} label="Users" />
            <NavItem href="/admin/subscriptions" icon={CreditCard} label="Subscriptions" />
            <NavItem href="/admin/reports" icon={LineChart} label="Reports" />
            <NavItem href="/admin/cms" icon={FileText} label="Content (CMS)" />
            <NavItem href="/admin/settings" icon={Settings} label="Settings" />
          </nav>
        </aside>
        <main className="flex-1 overflow-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItem({ href, icon: Icon, label, exact = false }: { href: string, icon: any, label: string, exact?: boolean }) {
  // In a real app, use usePathname() to detect active state
  const isActive = false; 
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-slate-900 text-white" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
