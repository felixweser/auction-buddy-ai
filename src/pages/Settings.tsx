import { ViewingSettings } from "@/components/settings/ViewingSettings";
import { TimeWindowManager } from "@/components/settings/TimeWindowManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Settings() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <main className="container mx-auto py-8 space-y-8">
            <ViewingSettings />
            <TimeWindowManager />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}