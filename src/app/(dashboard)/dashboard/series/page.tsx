import SeriesList from "@/components/dashboard/sermons/SeriesList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const SeriesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sermon Series</h1>
          <p className="text-muted-foreground">Manage sermons series</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/series/create">
            <Plus className="h-4 w-4" />
            Add Series
          </Link>
        </Button>
      </div>

      <SeriesList />
    </div>
  );
};

export default SeriesPage;
