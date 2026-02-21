import { Link, useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/dashboard.users";
import connectDB from "~/lib/db";
import User from "~/models/User";

// Loader function to fetch users from MongoDB
export async function loader() {
  try {
    await connectDB();
    
    const users = await User.find()
      .select('firstName lastName email phone createdAt certificateSentCount profilePhoto payment')
      .sort({ createdAt: -1 })
      .lean();

    // Subscription types and statuses for variety
    const subscriptionTypes = ['free', 'premium'];
    const subscriptionStatuses = ['active', 'trial', 'expired', 'cancelled'];
    const accountStatuses = ['active', 'inactive'];

    // DEBUG: Log all users' profilePhoto status
    console.log('🔍 DEBUG - Users profilePhoto summary:', {
      totalUsers: users.length,
      usersWithPhotos: users.filter(u => u.profilePhoto).length,
      photoTypes: users.filter(u => u.profilePhoto).map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        url: u.profilePhoto,
        isGoogle: u.profilePhoto?.includes('googleusercontent'),
        isFacebook: u.profilePhoto?.includes('facebook'),
        isBase64: u.profilePhoto?.startsWith('data:')
      }))
    });

    // Transform MongoDB data to match our UI expectations
    const transformedUsers = users.map((user: any, index: number) => {
      // Assign varied subscriptions for demo purposes
      const subType = user.payment?.subscriptionType || subscriptionTypes[index % subscriptionTypes.length];
      const subStatus = user.payment?.subscriptionStatus || subscriptionStatuses[index % subscriptionStatuses.length];
      const accStatus = accountStatuses[index % accountStatuses.length];
      
      // Calculate total spent based on subscription type
      let totalSpent = user.payment?.totalSpent || 0;
      if (totalSpent === 0) {
        if (subType === 'premium') totalSpent = 299.99;
      }

      return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        status: accStatus,
        joinDate: user.createdAt,
        challenges: 0, // You'll need to add logic to count challenges
        certificates: user.certificateSentCount || 0,
        profilePhoto: user.profilePhoto,
        subscriptionType: subType,
        subscriptionStatus: subStatus,
        totalSpent: totalSpent,
      };
    });

    return { users: transformedUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [] };
  }
}

export default function UsersManagement() {
  const { users: initialUsers } = useLoaderData<typeof loader>();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      // TODO: Add API call to delete user from database
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all users on your platform</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span className="font-medium">Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/dashboard/users/${user.id}`} className="flex items-center space-x-3 group">
                    {user.profilePhoto ? (
                      <img 
                        src={user.profilePhoto} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onLoad={(e) => {
                          console.log(`✅ Image loaded for ${user.firstName} ${user.lastName}`, user.profilePhoto);
                        }}
                        onError={(e) => {
                          console.error(`❌ Image FAILED for ${user.firstName} ${user.lastName}`, {
                            fullUrl: user.profilePhoto,
                            urlPreview: user.profilePhoto?.substring(0, 80),
                            isGoogle: user.profilePhoto?.includes('googleusercontent'),
                            errorTarget: e.target,
                            naturalWidth: e.currentTarget.naturalWidth,
                            naturalHeight: e.currentTarget.naturalHeight
                          });
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold ${user.profilePhoto ? 'hidden' : ''}`}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{user.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.subscriptionType === "premium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.subscriptionType.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.subscriptionStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : user.subscriptionStatus === "trial"
                          ? "bg-blue-100 text-blue-800"
                          : user.subscriptionStatus === "expired"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.subscriptionStatus.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ${user.totalSpent.toFixed(2)} spent
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>🎯 {user.challenges}</span>
                    <span>🎓 {user.certificates}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/dashboard/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="View Details"
                    >
                      👁️
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 p-2"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
          <span className="font-medium">{users.length}</span> users
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New User</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
