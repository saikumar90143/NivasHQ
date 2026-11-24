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
import { Edit2, Eye, Plus } from "lucide-react"

export default function BuilderProjectsPage() {
  const projects = [
    { id: "1", name: "Project Alpha", rera: "P02400001234", units: "120/150", status: "UNDER_CONSTRUCTION", launchDate: "2024-01-15" },
    { id: "2", name: "Project Beta", rera: "P02400005678", units: "45/50", status: "READY_TO_MOVE", launchDate: "2023-05-10" },
    { id: "3", name: "Project Gamma", rera: "Pending", units: "0/200", status: "UPCOMING", launchDate: "2025-02-01" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your building projects and unit inventory.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>RERA Number</TableHead>
              <TableHead>Units (Sold/Total)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Launch Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium text-slate-900">{project.name}</TableCell>
                <TableCell className="text-slate-600 font-mono text-sm">{project.rera}</TableCell>
                <TableCell>{project.units}</TableCell>
                <TableCell>
                  <Badge variant={
                    project.status === 'READY_TO_MOVE' ? 'default' : 
                    project.status === 'UPCOMING' ? 'secondary' : 'outline'
                  }>
                    {project.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{project.launchDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" title="View Public Page">
                      <Eye className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="outline" size="icon" title="Edit Project">
                      <Edit2 className="h-4 w-4 text-slate-600" />
                    </Button>
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
