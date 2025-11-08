import React from "react";
import { rolePermissions } from "./RoleManagement";
import { IUser } from "@/interfaces/user.interface";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

const RolesStats = ({ users }: { users: IUser[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {Object.entries(rolePermissions).map(([key, role]) => {
        const count = users.filter((user) => {
          if (key === "member") {
            // Users with no other roles are members
            return (
              !user.isSuperAdmin &&
              !user.isAdmin &&
              !user.isPastor &&
              !user.isInstructor
            );
          }
          // For other roles, check the boolean field on the user
          return user[key as keyof typeof user];
        }).length;

        return (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{role.name}</p>
                </div>
                <div className={`p-2 rounded-lg ${role.color.split(" ")[0]}`}>
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RolesStats;
