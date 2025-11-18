"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IUser } from "@/interfaces/user.interface";
import React, { useState } from "react";
import { rolePermissions } from "./RoleManagement";

const EditRolesForm = ({
  user,
  onSave,
  onCancel,
}: {
  user: IUser;
  onSave: (roles: string[]) => void;
  onCancel: () => void;
}) => {
  const editableRoles = ["super-admin", "admin", "pastor", "instructor"];

  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    const roles: string[] = [];
    if (user.isSuperAdmin) roles.push("super-admin");
    if (user.isAdmin) roles.push("admin");
    if (user.isPastor) roles.push("pastor");
    if (user.isInstructor) roles.push("instructor");
    return roles;
  });

  const handleRoleChange = (role: string, checked: boolean) => {
    let newRoles: string[];
    if (checked) {
      newRoles = [...selectedRoles, role];
    } else {
      newRoles = selectedRoles.filter((r) => r !== role);
    }

    // Ensure at least one role is selected
    if (newRoles.length === 0) return;

    setSelectedRoles(newRoles);
  };

  const handleSubmit = () => {
    onSave(selectedRoles);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {editableRoles.map((key) => {
          const role = rolePermissions[key as keyof typeof rolePermissions];
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedRoles.includes(key)}
                  onCheckedChange={(checked) =>
                    handleRoleChange(key, Boolean(checked))
                  }
                />
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {role.description}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className={role.color}>
                {role.name}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditRolesForm;
