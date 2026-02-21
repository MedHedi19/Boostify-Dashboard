import { useState } from "react";

const mockJobOffers = [
  {
    id: 1,
    title: "Team Leader",
    company: "Tech Corp",
    location: "New York, USA",
    type: "Full-time",
    salary: "$80,000 - $100,000",
    applications: 45,
    status: "active",
    postedDate: "2024-03-01",
    deadline: "2024-04-01"
  },
  {
    id: 2,
    title: "Project Manager",
    company: "Innovate Inc",
    location: "Remote",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    applications: 67,
    status: "active",
    postedDate: "2024-02-15",
    deadline: "2024-03-25"
  },
  {
    id: 3,
    title: "Scrum Master",
    company: "Agile Solutions",
    location: "San Francisco, USA",
    type: "Contract",
    salary: "$70/hour",
    applications: 32,
    status: "active",
    postedDate: "2024-03-10",
    deadline: "2024-04-10"
  },
  {
    id: 4,
    title: "Business Analyst",
    company: "Data Insights",
    location: "Boston, USA",
    type: "Full-time",
    salary: "$75,000 - $95,000",
    applications: 28,
    status: "closed",
    postedDate: "2024-01-20",
    deadline: "2024-02-20"
  },
];

export default function JobOffersManagement() {
  const [jobs, setJobs] = useState(mockJobOffers);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this job offer?")) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setJobs(jobs.map(j => 
      j.id === id 
        ? { ...j, status: j.status === "active" ? "closed" : "active" }
        : j
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Offers Management</h1>
          <p className="text-gray-600 mt-1">Manage job postings and applications</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span className="text-xl">➕</span>
          <span className="font-medium">Post Job</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Jobs</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Active Jobs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {jobs.filter(j => j.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Applications</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {jobs.reduce((sum, j) => sum + j.applications, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Avg per Job</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Math.round(jobs.reduce((sum, j) => sum + j.applications, 0) / jobs.length)}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-3xl">
                    💼
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        job.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {job.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{job.company}</p>
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        📍 {job.location}
                      </span>
                      <span className="flex items-center">
                        💰 {job.salary}
                      </span>
                      <span className="flex items-center">
                        👥 {job.applications} applications
                      </span>
                      <span className="flex items-center">
                        📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                    👁️ View
                  </button>
                  <button className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      job.status === "active"
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {job.status === "active" ? "⏸️ Close" : "▶️ Open"}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Post New Job</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Team Leader"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tech Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="New York, USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$80,000 - $100,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="List the job requirements..."
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
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
