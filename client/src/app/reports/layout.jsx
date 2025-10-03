import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReportsLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
