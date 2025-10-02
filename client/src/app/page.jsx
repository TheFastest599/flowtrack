import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Users, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Streamline Your Projects with{" "}
          <span className="text-blue-600">FlowTrack</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The ultimate enterprise project and task management system. Manage
          teams, track progress, and boost productivity with our scalable,
          secure platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-8">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="px-8">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose FlowTrack?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create, assign, and track tasks with ease. Stay organized and
                meet deadlines.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Foster teamwork with real-time updates, comments, and shared
                workspaces.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Advanced Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate insightful reports on project progress, team
                performance, and more.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level security with JWT authentication, role-based access,
                and data encryption.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of enterprises already using FlowTrack to manage
            their projects efficiently.
          </p>
          <Button asChild size="lg" variant="secondary" className="px-8">
            <Link href="/register">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
