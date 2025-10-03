// filepath: /home/anirban/Desktop/code/FlowTrack/client/src/app/projects/layout.jsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Layout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
