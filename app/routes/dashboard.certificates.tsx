import { useState } from "react";

const mockCertificates = [
  {
    id: 1,
    name: "Leadership Certificate",
    description: "Mastery in leadership fundamentals",
    issuedCount: 234,
    expiryMonths: 12,
    status: "active",
    createdDate: "2024-01-10"
  },
  {
    id: 2,
    name: "Communication Skills",
    description: "Advanced communication and presentation",
    issuedCount: 189,
    expiryMonths: 12,
    status: "active",
    createdDate: "2024-01-15"
  },
  {
    id: 3,
    name: "Problem Solving Expert",
    description: "Critical thinking and problem resolution",
    issuedCount: 156,
    expiryMonths: 6,
    status: "active",
    createdDate: "2024-02-01"
  },
];

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState(mockCertificates);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this certificate template?")) {
      setCertificates(certificates.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates Management</h1>
          <p className="text-gray-600 mt-1">Manage certificate templates and issuances</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span className="text-xl">➕</span>
          <span className="font-medium">New Certificate</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Certificate Types</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{certificates.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Issued</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {certificates.reduce((sum, c) => sum + c.issuedCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Active Templates</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {certificates.filter(c => c.status === "active").length}
          </p>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-linear-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border-2 border-purple-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">🎓</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                cert.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {cert.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{cert.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📜 Issued</span>
                <span className="font-bold text-gray-900">{cert.issuedCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⏰ Validity</span>
                <span className="font-medium text-gray-900">{cert.expiryMonths} months</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📅 Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(cert.createdDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-purple-200">
              <button className="flex-1 px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium border border-blue-200">
                👁️ Preview
              </button>
              <button className="flex-1 px-3 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium border border-green-200">
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(cert.id)}
                className="px-3 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium border border-red-200"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Certificate</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Leadership Certificate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what this certificate represents..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity Period (months)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="E.g., Complete 3 leadership challenges..."
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
                  Create Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
