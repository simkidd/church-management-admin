import Logo from "@/components/shared/Logo";
import { config } from "@/utils/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />

        {/* Top */}
        <div className="relative z-10 flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold">{config.SITE_NAME}</span>
        </div>

        {/* Middle */}
        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Church Learning Management System
          </h1>
          <p className="text-white/80 text-sm">
            Manage teachings, courses, and spiritual growth in one place.
          </p>

          <div className="text-sm italic text-white/70 border-l-2 border-white/40 pl-4">
            “Let all things be done decently and in order.” — 1 Corinthians
            14:40
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} {config.SITE_NAME}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center items-center gap-2 mb-6">
            <Logo />
            <span className="text-xl font-semibold">{config.SITE_NAME}</span>
          </div>

          {/* Scoped glass card */}
          <div className="rounded-2xl border bg-background/80 backdrop-blur-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
