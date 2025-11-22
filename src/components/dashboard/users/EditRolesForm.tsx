"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IUser } from "@/interfaces/user.interface";
import React, { useState } from "react";
import { rolePermissions } from "./RoleManagement";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import usersApi from "@/lib/api/user.api";
import { Toaster } from "@/components/ui/sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const editableRoles = ["super-admin", "admin", "pastor", "instructor"];

const EditRolesForm = ({
  user,
  onSave,
  onCancel,
}: {
  user: IUser;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const queryClient = useQueryClient();

  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    const roles: string[] = [];
    if (user.isSuperAdmin) roles.push("super-admin");
    if (user.isAdmin) roles.push("admin");
    if (user.isPastor) roles.push("pastor");
    if (user.isInstructor) roles.push("instructor");
    return roles;
  });

  const updateRoleMutation = useMutation({
    mutationFn: (roles: string[]) =>
      usersApi.updateUserRoles(user.id, { roles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      
      toast.success("Roles updated successfully", {
        description: `User roles have been updated for ${user.firstName} ${user.lastName}`,
      });
      onSave?.();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update roles", {
        description: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const handleRoleChange = (role: string, checked: boolean) => {
    let newRoles: string[];
    if (checked) {
      newRoles = [...selectedRoles, role];
    } else {
      newRoles = selectedRoles.filter((r) => r !== role);
    }

    setSelectedRoles(newRoles);
  };

  const handleSubmit = () => {
    updateRoleMutation.mutate(selectedRoles);
  };

  const hasChanges = () => {
    if (!user) return false;

    const currentRoles = [];
    if (user.isSuperAdmin) currentRoles.push("super-admin");
    if (user.isAdmin) currentRoles.push("admin");
    if (user.isPastor) currentRoles.push("pastor");
    if (user.isInstructor) currentRoles.push("instructor");

    return (
      JSON.stringify(currentRoles.sort()) !==
      JSON.stringify(selectedRoles.sort())
    );
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
                  disabled={updateRoleMutation.isPending}
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
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={updateRoleMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges() || updateRoleMutation.isPending}
        >
          {updateRoleMutation.isPending && (
            <Loader2 className=" h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditRolesForm;
