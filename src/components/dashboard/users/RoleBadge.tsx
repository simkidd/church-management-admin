import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role.toLowerCase()) {
      case "super admin":
        return { label: "Super Admin", class: "bg-red-100 text-red-800 hover:bg-red-100" };
      case "admin":
        return { label: "Admin", class: "bg-blue-100 text-blue-800 hover:bg-blue-100" };
      case "pastor":
        return { label: "Pastor", class: "bg-purple-100 text-purple-800 hover:bg-purple-100" };
      case "instructor":
        return { label: "Instructor", class: "bg-green-100 text-green-800 hover:bg-green-100" };
      default:
        return { label: "Member", class: "bg-gray-100 text-gray-800 hover:bg-gray-100" };
    }
  };

  const config = getRoleConfig(role);

  return (
    <Badge variant="secondary" className={config.class}>
      {config.label}
    </Badge>
  );
}