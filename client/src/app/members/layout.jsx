import ProtectedRoute from "@/components/ProtectedRoute";

export default function TeamsLayout({ children }) {
  return <ProtectedRoute requireAdmin={true}>{children}</ProtectedRoute>;
}
