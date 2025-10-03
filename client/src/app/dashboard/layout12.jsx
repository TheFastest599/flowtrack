import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
