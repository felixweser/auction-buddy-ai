import { ViewingSettings } from "@/components/settings/ViewingSettings";
import { TimeWindowManager } from "@/components/settings/TimeWindowManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Settings2, Calendar, Clock } from "lucide-react";

export default function Settings() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <main className="container mx-auto py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Settings2 className="h-8 w-8" />
                  Einstellungen
                </h1>
                <p className="text-muted-foreground mt-2">
                  Verwalten Sie Ihre Besichtigungszeiten und andere Einstellungen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Clock className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Besichtigungseinstellungen</h2>
                  </div>
                  <ViewingSettings />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Calendar className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Zeitfenster</h2>
                  </div>
                  <TimeWindowManager />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}