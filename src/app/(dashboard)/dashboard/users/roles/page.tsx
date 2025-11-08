import { RoleManagement } from "@/components/dashboard/users/RoleManagement";
import { Shield } from "lucide-react";

export default function RoleManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions across the system
            </p>
          </div>
        </div>
      </div>

      <RoleManagement />
    </div>
  );
}
