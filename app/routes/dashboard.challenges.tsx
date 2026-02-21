import { useState } from "react";

const mockChallenges = [
  {
    id: 1,
    title: "Leadership Fundamentals",
    category: "Leadership",
    difficulty: "Intermediate",
    duration: "2 weeks",
    participants: 234,
    completionRate: 78,
    status: "active",
    createdDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Public Speaking Mastery",
    category: "Communication",
    difficulty: "Advanced",
    duration: "3 weeks",
    participants: 189,
    completionRate: 65,
    status: "active",
    createdDate: "2024-02-01"
  },
  {
    id: 3,
    title: "Time Management",
    category: "Productivity",
    difficulty: "Beginner",
    duration: "1 week",
    participants: 456,
    completionRate: 92,
    status: "active",
    createdDate: "2024-01-20"
  },
  {
    id: 4,
    title: "Problem Solving",
    category: "Critical Thinking",
    difficulty: "Intermediate",
    duration: "2 weeks",
    participants: 312,
    completionRate: 71,
    status: "draft",
    createdDate: "2024-03-10"
  },
];

export default function ChallengesManagement() {
  const [challenges, setChallenges] = useState(mockChallenges);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this challenge?")) {
      setChallenges(challenges.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setChallenges(challenges.map(c => 
      c.id === id 
        ? { ...c, status: c.status === "active" ? "draft" : "active" }
        : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenges Management</h1>
          <p className="text-gray-600 mt-1">Create and manage daily challenges</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span className="text-xl">➕</span>
          <span className="font-medium">New Challenge</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Challenges</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{challenges.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {challenges.filter(c => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Participants</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {challenges.reduce((sum, c) => sum + c.participants, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Avg Completion</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Math.round(challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length)}%
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    {challenge.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    challenge.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                    challenge.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    challenge.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {challenge.status}
                  </span>
                </div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⏱️ Duration</span>
                <span className="font-medium text-gray-900">{challenge.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">👥 Participants</span>
                <span className="font-medium text-gray-900">{challenge.participants}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">✅ Completion Rate</span>
                <span className="font-medium text-gray-900">{challenge.completionRate}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${challenge.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                ✏️ Edit
              </button>
              <button
                onClick={() => handleToggleStatus(challenge.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                  challenge.status === "active"
                    ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {challenge.status === "active" ? "⏸️ Draft" : "▶️ Activate"}
              </button>
              <button
                onClick={() => handleDelete(challenge.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Challenge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Challenge</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leadership Fundamentals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Leadership</option>
                    <option>Communication</option>
                    <option>Productivity</option>
                    <option>Critical Thinking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe the challenge..."
                  />
                </div>
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
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
