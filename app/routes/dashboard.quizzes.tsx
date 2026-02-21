import { useState } from "react";
import { Link } from "react-router";

const mockQuizzes = [
  {
    id: 1,
    title: "Leadership Assessment Quiz",
    category: "Leadership",
    questions: 15,
    duration: "20 minutes",
    attempts: 342,
    avgScore: 78,
    status: "active",
    createdDate: "2024-01-10"
  },
  {
    id: 2,
    title: "Communication Skills Evaluation",
    category: "Communication",
    questions: 20,
    duration: "25 minutes",
    attempts: 289,
    avgScore: 82,
    status: "active",
    createdDate: "2024-01-15"
  },
  {
    id: 3,
    title: "Time Management Quiz",
    category: "Productivity",
    questions: 12,
    duration: "15 minutes",
    attempts: 456,
    avgScore: 85,
    status: "active",
    createdDate: "2024-02-01"
  },
  {
    id: 4,
    title: "Problem Solving Test",
    category: "Critical Thinking",
    questions: 18,
    duration: "30 minutes",
    attempts: 234,
    avgScore: 71,
    status: "draft",
    createdDate: "2024-03-05"
  },
];

export default function QuizzesManagement() {
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setQuizzes(quizzes.map(q => 
      q.id === id 
        ? { ...q, status: q.status === "active" ? "draft" : "active" }
        : q
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-1">Create and manage assessment quizzes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span className="text-xl">➕</span>
          <span className="font-medium">New Quiz</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{quizzes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {quizzes.filter(q => q.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Attempts</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {quizzes.reduce((sum, q) => sum + q.attempts, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Avg Score</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Math.round(quizzes.reduce((sum, q) => sum + q.avgScore, 0) / quizzes.length)}%
          </p>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    {quiz.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    quiz.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {quiz.status}
                  </span>
                </div>
              </div>
              <span className="text-4xl">📝</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">❓ Questions</span>
                <span className="font-medium text-gray-900">{quiz.questions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⏱️ Duration</span>
                <span className="font-medium text-gray-900">{quiz.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">👥 Attempts</span>
                <span className="font-medium text-gray-900">{quiz.attempts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📊 Avg Score</span>
                <span className="font-bold text-blue-600">{quiz.avgScore}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${quiz.avgScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                ✏️ Edit
              </button>
              <button
                onClick={() => handleToggleStatus(quiz.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                  quiz.status === "active"
                    ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {quiz.status === "active" ? "⏸️ Draft" : "▶️ Activate"}
              </button>
              <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium">
                📊 Results
              </button>
              <button
                onClick={() => handleDelete(quiz.id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Quiz Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Quiz</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leadership Assessment Quiz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" title="Category">
                    <option>Leadership</option>
                    <option>Communication</option>
                    <option>Productivity</option>
                    <option>Critical Thinking</option>
                    <option>Technical Skills</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="20"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the quiz purpose and what it assesses..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Randomize Questions</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Show Correct Answers After Completion</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Allow Multiple Attempts</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Require Certificate Upon Passing</span>
                    </label>
                  </div>
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
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
