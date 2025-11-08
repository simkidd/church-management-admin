import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SermonList } from "@/components/dashboard/sermons/SermonList"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function SermonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sermon Management</h1>
          <p className="text-muted-foreground">Manage sermons and preaching content</p>
        </div>
        <Link href="/dashboard/sermons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sermon
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          <SermonList />
        </CardContent>
      </Card>
    </div>
  )
}