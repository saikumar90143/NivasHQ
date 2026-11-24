import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, FileSearch } from "lucide-react"

export default function AdminAgentsPage() {
  const agents = [
    { id: "1", name: "Rajesh Kumar", email: "rajesh@example.com", status: "PENDING", license: "LIC-89432", submitted: "2 hours ago" },
    { id: "2", name: "Priya Sharma", email: "priya@example.com", status: "VERIFIED", license: "LIC-11234", submitted: "1 day ago" },
    { id: "3", name: "Anil Reddy", email: "anil@example.com", status: "REJECTED", license: "LIC-99882", submitted: "3 days ago" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agent Verification</h1>
          <p className="text-muted-foreground mt-1">Review and approve agent KYC & licenses.</p>
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>License No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-slate-500">{agent.email}</div>
                </TableCell>
                <TableCell>{agent.license}</TableCell>
                <TableCell>
                  <Badge variant={
                    agent.status === 'VERIFIED' ? 'default' : 
                    agent.status === 'REJECTED' ? 'destructive' : 'secondary'
                  }>
                    {agent.status}
                  </Badge>
                </TableCell>
                <TableCell>{agent.submitted}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" title="View Documents">
                      <FileSearch className="h-4 w-4 text-slate-600" />
                    </Button>
                    {agent.status === 'PENDING' && (
                      <>
                        <Button variant="outline" size="icon" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
