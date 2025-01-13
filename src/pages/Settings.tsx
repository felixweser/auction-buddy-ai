import { ViewingSettings } from "@/components/settings/ViewingSettings";
import { TimeWindowManager } from "@/components/settings/TimeWindowManager";

export default function Settings() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <ViewingSettings />
      <TimeWindowManager />
    </div>
  );
}