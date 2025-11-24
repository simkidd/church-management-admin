import { SermonList } from "@/components/dashboard/sermons/SermonList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SermonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sermon Management
          </h1>
          <p className="text-muted-foreground">
            Manage sermons and preaching content
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/sermons/create">
            <Plus className="h-4 w-4" />
            Add Sermon
          </Link>
        </Button>
      </div>

      <SermonList />
    </div>
  );
}
