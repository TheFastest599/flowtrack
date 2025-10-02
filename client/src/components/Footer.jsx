import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FlowTrack</h3>
            <p className="text-gray-400">
              Manage your projects and tasks efficiently.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-400 hover:text-white"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="text-gray-400 hover:text-white">
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="text-gray-400 hover:text-white"
                >
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: support@flowtrack.com</p>
            <p className="text-gray-400">
              © 2025 FlowTrack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
