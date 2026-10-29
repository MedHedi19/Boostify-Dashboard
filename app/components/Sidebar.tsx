import { NavLink, useLocation } from "react-router";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Analytics", path: "/dashboard/analytics", icon: "📈" },
  { name: "Users Profiling", path: "/dashboard/users", icon: "👥" },
  { name: "Users Coaching", path: "/dashboard/quizzes", icon: "📝" },
  { name: "Users Empowering", path: "/dashboard/certificates", icon: "🎓" },
  { name: "21 days challenge", path: "/dashboard/challenges", icon: "🎯" },
  { name: "Job Offers", path: "/dashboard/job-offers", icon: "💼" },
  { name: "Admins", path: "/dashboard/admins", icon: "👨‍💼" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen fixed left-0 top-0 overflow-y-auto z-50 shadow-2xl border-r border-slate-800/50">
      <div className="p-6">
        <div className="mb-10 flex flex-col items-center justify-center">
          <img src="/BoostifyLogo.jpg" alt="Boostify Skills" className="h-16 w-auto drop-shadow-lg" />
          <h1 className="mt-3 text-xl font-bold text-white tracking-wide">Boostify Skills</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${isActive
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-md"
                  }`
                }
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className="font-semibold tracking-wide">{item.name}</span>
                {location.pathname === item.path && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800/50 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="flex items-center space-x-4 p-3 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Admin User</p>
            <p className="text-xs text-slate-400">admin@upskilling.com</p>
          </div>
          <div className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
