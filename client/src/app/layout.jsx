import { Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import RefreshTokenWrapper from "@/components/RefreshTokenWrapper";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AutoBreadcrumb } from "@/components/Breadcrumb";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // choose what you need
  variable: "--font-poppins",
});

export const metadata = {
  title: "Flowtrack",
  description:
    "The ultimate enterprise project and task management system. Manage teams, track progress, and boost productivity with our scalable, secure platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable}  antialiased`}>
        <RefreshTokenWrapper />
        <Navbar />
        <QueryProvider>
          <main className="max-w-7xl my-4 mx-4 sm:mx-6 xl:mx-auto min-h-screen">
            <AutoBreadcrumb />
            {children}
          </main>
        </QueryProvider>
        <Toaster position="top-right" richColors />
        <Footer />
      </body>
    </html>
  );
}
