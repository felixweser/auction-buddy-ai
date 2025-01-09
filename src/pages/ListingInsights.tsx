import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartBar, DollarSign, Users } from "lucide-react";

interface InterestedUser {
  id: string;
  username: string | null;
  offer_amount: number;
  message_count: number;
}

const ListingInsights = () => {
  const { id } = useParams<{ id: string }>();

  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: interestedUsers } = useQuery({
    queryKey: ["interested-users", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          sender_id,
          content,
          profiles!messages_sender_id_profiles_fkey (
            username
          )
        `)
        .eq("listing_id", id);

      if (error) throw error;

      // Process messages to extract offers and count messages per user
      const userStats = data.reduce((acc: { [key: string]: InterestedUser }, message) => {
        const senderId = message.sender_id;
        const username = message.profiles?.username;
        
        if (!acc[senderId]) {
          acc[senderId] = {
            id: senderId,
            username: username,
            offer_amount: 0,
            message_count: 0,
          };
        }

        // Check if message contains an offer (assuming offers are in format "$X" or "X dollars")
        const offerMatch = message.content.match(/\$?(\d+)(?:\s*dollars?)?/i);
        if (offerMatch) {
          const amount = parseInt(offerMatch[1]);
          if (amount > acc[senderId].offer_amount) {
            acc[senderId].offer_amount = amount;
          }
        }

        acc[senderId].message_count++;
        return acc;
      }, {});

      return Object.values(userStats);
    },
  });

  if (!property) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Property Insights
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                {property.title}
              </p>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Interested Users</h3>
                </div>
                <p className="text-2xl font-bold">
                  {interestedUsers?.length || 0}
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Highest Offer</h3>
                </div>
                <p className="text-2xl font-bold">
                  ${Math.max(...(interestedUsers?.map(u => u.offer_amount) || [0]), 0)}
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Total Messages</h3>
                </div>
                <p className="text-2xl font-bold">
                  {interestedUsers?.reduce((sum, user) => sum + user.message_count, 0) || 0}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Latest Offer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interestedUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username || "Anonymous"}</TableCell>
                      <TableCell>{user.message_count}</TableCell>
                      <TableCell>
                        {user.offer_amount > 0 ? `$${user.offer_amount}` : "No offer"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!interestedUsers || interestedUsers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No interested users yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ListingInsights;