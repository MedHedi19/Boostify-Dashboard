import { Link, useLoaderData } from "react-router";
import connectDB from "~/lib/db";
import User from "~/models/User";

// Loader function to fetch recent users from MongoDB
export async function loader() {
  try {
    await connectDB();
    
    // Get the 5 most recent users
    const recentUsers = await User.find()
      .select('firstName lastName email createdAt payment profilePhoto')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get total counts for stats
    const totalUsers = await User.countDocuments();

    return { 
      recentUsers,
      totalUsers
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { 
      recentUsers: [],
      totalUsers: 0
    };
  }
}

export default function DashboardHome() {
  const { recentUsers, totalUsers } = useLoaderData<typeof loader>();

  const stats = [
    { label: "Total Users", value: totalUsers.toString(), change: "+12%", icon: "👥", color: "blue" },
    { label: "Active Challenges", value: "45", change: "+5%", icon: "🎯", color: "green" },
    { label: "Active Quizzes", value: "28", change: "+8%", icon: "📝", color: "pink" },
    { label: "Certificates Issued", value: "892", change: "+18%", icon: "🎓", color: "purple" },
  ];

  // Format time ago helper
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm font-medium mt-2 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`text-5xl opacity-20`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Join latest</h3>
          <div className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any, index: number) => (
                <Link 
                  key={user._id} 
                  to={`/dashboard/users/${user._id}`}
                  className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors"
                >
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onLoad={() => console.log(`✅ Dashboard: ${user.firstName} photo loaded`)}
                      onError={(e) => {
                        console.error(`❌ Dashboard: ${user.firstName} photo failed`, user.profilePhoto?.substring(0, 60));
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold ${user.profilePhoto ? 'hidden' : ''}`}>
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600">Registered</span>
                      {user.payment?.subscriptionType === 'premium' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{timeAgo(user.createdAt)}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/users" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <span className="text-3xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link to="/dashboard/challenges" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <span className="text-3xl mb-2">🎯</span>
              <span className="text-sm font-medium text-gray-700">Manage Challenges</span>
            </Link>
            <Link to="/dashboard/quizzes" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <span className="text-3xl mb-2">📝</span>
              <span className="text-sm font-medium text-gray-700">Manage Quizzes</span>
            </Link>
            <Link to="/dashboard/certificates" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <span className="text-3xl mb-2">🎓</span>
              <span className="text-sm font-medium text-gray-700">Manage Certificates</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
