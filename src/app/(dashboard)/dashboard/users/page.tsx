import { UserManagement } from "@/components/dashboard/users/UserManagement";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

export default function UsersPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage all users and their roles
            </p>
          </div>
        </div>
        <Link href="/dashboard/users/create">
          <Button>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="w-full">
        <UserManagement />
      </div>
    </div>
  );
}
