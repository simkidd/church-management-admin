import { EventList } from "@/components/dashboard/events/EventList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">Schedule and manage church events</p>
        </div>
        <Link href="/dashboard/events/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

       <EventList />
    </div>
  )
}