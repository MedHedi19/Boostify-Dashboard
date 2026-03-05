import { Link, useLocation } from "react-router";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Users", path: "/dashboard/users", icon: "👥" },
  { name: "Admins", path: "/dashboard/admins", icon: "👨‍💼" },
  { name: "Challenges", path: "/dashboard/challenges", icon: "🎯" },
  { name: "7P", path: "/dashboard/quizzes", icon: "📝" },
  { name: "21 day challenge", path: "/dashboard/certificates", icon: "🎓" },
  { name: "Job Offers", path: "/dashboard/job-offers", icon: "💼" },
  { name: "Analytics", path: "/dashboard/analytics", icon: "📈" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">🚀 Boostify</h1>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            👤
          </div>
          <div>
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@upskilling.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
