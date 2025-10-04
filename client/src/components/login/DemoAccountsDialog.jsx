import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const demoAccounts = [
  {
    name: "Anirban Saha",
    email: "ribhusaha2003@gmail.com",
    password: "P@ssword-123",
    role: "admin",
  },
  {
    name: "John Smith",
    email: "john.smith@flowtrack.com",
    password: "1234",
    role: "admin",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "David Wilson",
    email: "david.wilson@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "James Brown",
    email: "james.brown@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Anna Taylor",
    email: "anna.taylor@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Robert Lee",
    email: "robert.lee@flowtrack.com",
    password: "1234",
    role: "member",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@flowtrack.com",
    password: "1234",
    role: "member",
  },
];

export default function DemoAccountsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs p-0 h-auto">
          Demo Accounts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Demo Accounts</DialogTitle>
          <DialogDescription>
            Use these accounts to explore FlowTrack.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {demoAccounts.map((account, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <p className="font-medium text-sm">{account.name}</p>
              <p className="text-xs text-muted-foreground">
                Email: {account.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Password: {account.password}
              </p>
              <Badge
                variant={account.role === "admin" ? "default" : "secondary"}
                className="text-xs"
              >
                {account.role}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
