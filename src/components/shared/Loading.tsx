import { Loader2 } from "lucide-react"

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">Loading Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Preparing your management tools...
          </p>
        </div>
      </div>
    </div>
  )
}