import Logo from "@/components/shared/Logo";
import { config } from "@/utils/config";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <Logo />
          <span className="font-medium text-xl">{config.SITE_NAME}</span>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
