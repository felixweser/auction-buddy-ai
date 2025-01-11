import { ViewingSchedule } from "@/components/settings/ViewingSchedule";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Settings() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <ViewingSchedule />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}