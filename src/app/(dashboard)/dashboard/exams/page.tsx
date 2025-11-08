import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExamList } from "@/components/dashboard/exams/ExamList"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">Create and manage exams</p>
        </div>
        <Link href="/dashboard/exams/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamList />
        </CardContent>
      </Card>
    </div>
  )
}