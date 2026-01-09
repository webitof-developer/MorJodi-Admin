import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, Eye, FilePenLine, CheckCircle, XCircle, Clock, Inbox } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageComplaints = () => {
  const token = localStorage.getItem("authToken");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.complaints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      Swal.fire("Error", "Failed to fetch complaints.", "error");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This complaint will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(complaints.filter((c) => c._id !== id));
      Swal.fire("Deleted!", "Complaint has been removed.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete complaint.", "error");
    }
  };

  const statusTabs = [
    { id: "all", label: "All", icon: <Inbox size={16} /> },
    { id: "open", label: "Open", icon: <Inbox size={16} /> },
    { id: "in progress", label: "In Progress", icon: <Clock size={16} /> },
    { id: "solved", label: "Solved", icon: <CheckCircle size={16} /> },
    { id: "closed", label: "Closed", icon: <XCircle size={16} /> },
  ];

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.userId?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(search.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && c.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "open": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "in progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "solved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const loadingSkeleton = (
    <div className="space-y-4 animate-pulse p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 w-full md:w-64 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700 pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-4 shadow-sm dark:border-gray-800 dark:bg-slate-900">
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return loadingSkeleton;

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold dark:text-white">Manage Complaints</h2>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search users or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700 pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === tab.id
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">#</th>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Subject</th>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint, index) => (
                <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {complaint.userId?.fullName || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-500">{complaint.userId?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={complaint.subject}>
                    {complaint.subject}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/complaint-details/${complaint._id}`}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View & Reply"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No complaints found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageComplaints;
