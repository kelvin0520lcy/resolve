import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ResolveProvider } from "@/contexts/resolve-context";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { CommandPalette } from "@/components/layout/command-palette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ResolveProvider>
        <div className="flex min-h-screen bg-transparent">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-20 lg:pb-0">
            {children}
          </div>
          <MobileNav />
          <WorkspaceStatus />
          <CommandPalette />
        </div>
      </ResolveProvider>
    </ProtectedRoute>
  );
}

export { AppHeader };
