import { Link, useParams, useLoaderData, Form, redirect } from "react-router";
import { useState } from "react";
import connectDB from "../lib/db";
import User from "../models/User";
import PersonalityTest from "../models/PersonalityTest";
import type { Route } from "./+types/dashboard.users.$id";

// Loader function to fetch user data from MongoDB
export async function loader({ params }: Route.LoaderArgs) {
  await connectDB();

  const user = await User.findById(params.id).lean();

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const personalityTest = await PersonalityTest.findOne({ userId: params.id }).lean();

  // Add demo subscription data if not present
  if (!user.payment) {
    user.payment = {
      subscriptionType: 'free',
      subscriptionStatus: 'active',
      totalSpent: 0,
    };
  }

  return { user, personalityTest };
}

// Action function to handle form submissions (edit user)
export async function action({ request, params }: Route.ActionArgs) {
  await connectDB();

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update") {
    const updates = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    };

    await User.findByIdAndUpdate(params.id, updates);
    return redirect(`/dashboard/users/${params.id}`);
  }

  return null;
}

export default function UserDetail() {
  const params = useParams();
  const { user, personalityTest } = useLoaderData<typeof loader>();
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleBlock = () => {
    alert("User blocked successfully!");
    setShowBlockModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/dashboard/users" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <span className="mr-2">←</span> Back to Users
      </Link>

      {/* User Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-linear-to-r from-blue-500 to-purple-600"></div>
        <div className="px-8 pb-6">
          <div className="flex items-start justify-between -mt-16">
            <div className="flex items-end space-x-4">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onLoad={() => console.log(`✅ User Detail: ${user.firstName} photo loaded`)}
                  onError={(e) => {
                    console.error(`❌ User Detail: ${user.firstName} photo failed`, user.profilePhoto?.substring(0, 60));
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-32 h-32 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 ${user.profilePhoto ? 'hidden' : ''}`}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  <span className="text-sm text-gray-600">
                    📅 Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    🕐 Last updated {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => alert('Message feature coming soon!')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => alert('Message feature coming soon!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                💬 Message
              </button>
              <button
                onClick={() => alert('Message feature coming soon!')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🚫 Block User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats and Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">� Certificates Sent</span>
                <span className="font-bold text-gray-900">{user.certificateSentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">📧 Email</span>
                <span className="font-bold text-gray-900">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">📱 Phone</span>
                  <span className="font-bold text-gray-900">{user.phone}</span>
                </div>
              )}
              {user.profilePhoto && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-gray-600">📸 Profile Photo</span>
                  <span className="text-xs text-green-600">✓ Set</span>
                </div>
              )}
            </div>
          </div>

          {/* Authentication Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
            <div className="space-y-3">
              {user.password && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Password Auth</p>
                  <p className="text-sm text-green-600">✓ Enabled</p>
                </div>
              )}
              {user.socialAuth?.googleId && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Google</p>
                  <p className="text-sm text-green-600">✓ Connected</p>
                </div>
              )}
              {user.socialAuth?.facebookId && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Facebook</p>
                  <p className="text-sm text-green-600">✓ Connected</p>
                </div>
              )}
              {user.socialAuth?.linkedinId && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">LinkedIn</p>
                  <p className="text-sm text-green-600">✓ Connected</p>
                </div>
              )}
              {!user.password && !user.socialAuth?.googleId && !user.socialAuth?.facebookId && !user.socialAuth?.linkedinId && (
                <p className="text-sm text-gray-500">No authentication methods configured</p>
              )}
            </div>
          </div>

          {/* Account Dates */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Created</p>
                <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Last Updated</p>
                <p className="text-sm text-gray-900">{new Date(user.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Plan</p>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${user.payment?.subscriptionType === "premium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
                  }`}>
                  {(user.payment?.subscriptionType || 'free').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.payment?.subscriptionStatus === "active"
                  ? "bg-green-100 text-green-800"
                  : user.payment?.subscriptionStatus === "trial"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                  }`}>
                  {(user.payment?.subscriptionStatus || 'active').toUpperCase()}
                </span>
              </div>
              {user.payment?.totalSpent !== undefined && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Spent</p>
                  <p className="text-lg font-bold text-green-600">${user.payment.totalSpent.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">First Name</p>
                <p className="text-lg font-medium text-gray-900">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Last Name</p>
                <p className="text-lg font-medium text-gray-900">{user.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Email Address</p>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">{user.phone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Social Authentication Card */}
          {(user.socialAuth?.googleId || user.socialAuth?.facebookId || user.socialAuth?.linkedinId) && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Connections</h3>
              <div className="space-y-3">
                {user.socialAuth?.googleId && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔴</span>
                      <div>
                        <p className="font-medium text-gray-900">Google</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-semibold">✓ Active</span>
                  </div>
                )}
                {user.socialAuth?.facebookId && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔵</span>
                      <div>
                        <p className="font-medium text-gray-900">Facebook</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-semibold">✓ Active</span>
                  </div>
                )}
                {user.socialAuth?.linkedinId && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💼</span>
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-semibold">✓ Active</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{user.certificateSentCount || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Certificates</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-gray-600 mt-1">Days Active</p>
              </div>
              <div className={`p-4 border rounded-lg text-center flex flex-col justify-center min-h-[104px] ${personalityTest?.dominantColor === 'R' ? 'bg-red-50 border-red-200' :
                  (personalityTest?.dominantColor === 'V' || personalityTest?.dominantColor === 'G') ? 'bg-green-50 border-green-200' :
                    (personalityTest?.dominantColor === 'J' || personalityTest?.dominantColor === 'Y') ? 'bg-yellow-50 border-yellow-200' :
                      personalityTest?.dominantColor === 'B' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                }`}>
                {personalityTest?.dominantColor ? (
                  <>
                    <p className={`text-4xl font-bold ${personalityTest.dominantColor === 'R' ? 'text-red-600' :
                        (personalityTest.dominantColor === 'V' || personalityTest.dominantColor === 'G') ? 'text-green-600' :
                          (personalityTest.dominantColor === 'J' || personalityTest.dominantColor === 'Y') ? 'text-yellow-600' :
                            'text-blue-600'
                      }`}>
                      {personalityTest.dominantColor}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Dominant Color</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">User didn't complete the test yet!</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <span className="text-2xl">💳</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Subscription Plan</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-4 py-2 text-sm font-bold rounded-lg ${user.payment?.subscriptionType === "premium"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-600 text-white"
                    }`}>
                    {(user.payment?.subscriptionType || 'free').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${user.payment?.subscriptionStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : user.payment?.subscriptionStatus === "trial"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {(user.payment?.subscriptionStatus || 'active').toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(user.payment?.totalSpent || 0).toFixed(2)}
                </p>
              </div>
              {user.payment?.subscriptionStartDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.payment.subscriptionStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {user.payment?.subscriptionEndDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">End Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.payment.subscriptionEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {user.payment?.lastPaymentDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Last Payment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.payment.lastPaymentDate).toLocaleDateString()}
                  </p>
                  {user.payment?.lastPaymentAmount && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ${user.payment.lastPaymentAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
              {user.payment?.paymentMethod && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.payment.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User Profile</h3>
            <Form method="post">
              <input type="hidden" name="intent" value="update" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={user.firstName}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={user.lastName}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={user.phone || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Block User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to block {user.firstName} {user.lastName}?
              This will prevent them from accessing the platform.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Enter reason for blocking..."
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                style={{ color: 'red' }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
