export default function Analytics() {
  const monthlyData = [
    { month: "Jan", users: 120, challenges: 45, certificates: 32, premiumSubs: 12 },
    { month: "Feb", users: 180, challenges: 58, certificates: 41, premiumSubs: 28 },
    { month: "Mar", users: 234, challenges: 72, certificates: 55, premiumSubs: 45 },
  ];

  const topUsers = [
    { name: "John Doe", points: 2450, challenges: 12, certificates: 3 },
    { name: "Jane Smith", points: 2280, challenges: 11, certificates: 3 },
    { name: "Mike Johnson", points: 2150, challenges: 15, certificates: 5 },
    { name: "Sarah Williams", points: 1980, challenges: 9, certificates: 2 },
    { name: "Tom Brown", points: 1850, challenges: 10, certificates: 4 },
  ];

  const popularChallenges = [
    { name: "Time Management", participants: 456, completion: 92 },
    { name: "Leadership Fundamentals", participants: 312, completion: 78 },
    { name: "Public Speaking", participants: 234, completion: 65 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">+23%</p>
              <p className="text-xs text-green-600 mt-1">↑ vs last month</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
              <p className="text-xs text-green-600 mt-1">↑ vs last month</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retention</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">94%</p>
              <p className="text-xs text-green-600 mt-1">↑ vs last month</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">24m</p>
              <p className="text-xs text-green-600 mt-1">↑ vs last month</p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-end space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Challenges</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Certificates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Premium Subs</span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative">
            <svg viewBox="0 0 300 180" className="w-full h-48">
              {/* Grid lines */}
              <line x1="0" y1="150" x2="300" y2="150" stroke="#e5e7eb" strokeWidth="1"/>
              <line x1="0" y1="112.5" x2="300" y2="112.5" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="0" y1="75" x2="300" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="0" y1="0" x2="300" y2="0" stroke="#e5e7eb" strokeWidth="1"/>

              {/* Users Line - Blue */}
              <path
                d="M 50 120 Q 125 90, 150 60 T 250 30"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              {/* Users Area Fill */}
              <path
                d="M 50 120 Q 125 90, 150 60 T 250 30 L 250 150 L 50 150 Z"
                fill="#3b82f6"
                fillOpacity="0.1"
              />

              {/* Challenges Line - Green */}
              <path
                d="M 50 135 Q 125 120, 150 105 T 250 75"
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Certificates Line - Purple */}
              <path
                d="M 50 142 Q 125 130, 150 120 T 250 95"
                stroke="#a855f7"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Premium Subscriptions Line - Yellow */}
              <path
                d="M 50 145 Q 125 138, 150 132 T 250 115"
                stroke="#eab308"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Data Points - Users */}
              <circle cx="50" cy="120" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
              <circle cx="150" cy="60" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
              <circle cx="250" cy="30" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>

              {/* Data Points - Challenges */}
              <circle cx="50" cy="135" r="3" fill="#10b981" stroke="white" strokeWidth="2"/>
              <circle cx="150" cy="105" r="3" fill="#10b981" stroke="white" strokeWidth="2"/>
              <circle cx="250" cy="75" r="3" fill="#10b981" stroke="white" strokeWidth="2"/>

              {/* Data Points - Certificates */}
              <circle cx="50" cy="142" r="3" fill="#a855f7" stroke="white" strokeWidth="2"/>
              <circle cx="150" cy="120" r="3" fill="#a855f7" stroke="white" strokeWidth="2"/>
              <circle cx="250" cy="95" r="3" fill="#a855f7" stroke="white" strokeWidth="2"/>

              {/* Data Points - Premium Subscriptions */}
              <circle cx="50" cy="145" r="3" fill="#eab308" stroke="white" strokeWidth="2"/>
              <circle cx="150" cy="132" r="3" fill="#eab308" stroke="white" strokeWidth="2"/>
              <circle cx="250" cy="115" r="3" fill="#eab308" stroke="white" strokeWidth="2"/>

              {/* Month Labels */}
              <text x="50" y="170" textAnchor="middle" className="text-xs fill-gray-600" fontSize="12">Jan</text>
              <text x="150" y="170" textAnchor="middle" className="text-xs fill-gray-600" fontSize="12">Feb</text>
              <text x="250" y="170" textAnchor="middle" className="text-xs fill-gray-600" fontSize="12">Mar</text>
            </svg>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">234</p>
              <p className="text-xs text-gray-600 mt-1">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">72</p>
              <p className="text-xs text-gray-600 mt-1">Challenges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">55</p>
              <p className="text-xs text-gray-600 mt-1">Certificates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">45</p>
              <p className="text-xs text-gray-600 mt-1">Premium Subs</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">
                    🎯 {user.challenges} challenges • 🎓 {user.certificates} certs
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{user.points}</p>
                  <p className="text-xs text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Challenges */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularChallenges.map((challenge, index) => (
            <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🏆</span>
                <span className="text-sm font-bold text-gray-900">
                  {challenge.completion}%
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{challenge.name}</h4>
              <p className="text-sm text-gray-600">👥 {challenge.participants} participants</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${challenge.completion}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Day</h3>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
              <div className={`h-24 rounded-lg ${
                index < 5 ? "bg-blue-500" : "bg-blue-200"
              } flex items-center justify-center text-white font-bold`}>
                {index < 5 ? "High" : "Low"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
