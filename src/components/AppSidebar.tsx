import { Search, User, Settings, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleSidebar, state } = useSidebar();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    navigate("/auth");
  };

  const items = [
    {
      title: "Search Products",
      icon: Search,
      onClick: () => navigate("/"),
    },
    {
      title: "My Items",
      icon: User,
      onClick: () => navigate("/my-items"),
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {/* Mobile toggle button - fixed position */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 p-2 bg-background hover:bg-accent rounded-md transition-colors border shadow-sm md:hidden"
        aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      >
        {state === "expanded" ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeft className="h-5 w-5" />
        )}
      </button>

      {/* Desktop toggle button - fixed position when sidebar is collapsed */}
      <button
        onClick={toggleSidebar}
        className={`fixed left-4 top-4 z-50 p-2 bg-background hover:bg-accent rounded-md transition-all duration-200 border shadow-sm hidden md:flex
          ${state === "expanded" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              {/* In-sidebar toggle button - only visible when sidebar is expanded */}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-accent rounded-md transition-colors hidden md:block"
                aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={item.onClick}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}