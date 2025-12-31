import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search,FilePenLine,Eye } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageComplaints = () => {
  const token = localStorage.getItem("authToken");
  

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
console.log(res.data.complaints)
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

  const filteredComplaints = complaints.filter((c) =>
    (c.userId?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (c.subject || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <div>Loading complaints...</div>;

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">
          Manage Complaints
        </h2>

        <div className="relative">
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-soft pl-10"
          />
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">User</th>
                <th className="table-head">Subject</th>
                <th className="table-head">Message</th>
                <th className="table-head">Status</th>
                <th className="table-head">Date</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>

            <tbody className="table-body">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint, index) => (
                  <tr key={complaint._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>

                    <td className="table-cell">{complaint.userId?.fullName || "-"}</td>

                    <td className="table-cell">{complaint.subject}</td>

                    <td className="table-cell w-64 truncate">{complaint.message}</td>

                    <td className="table-cell capitalize">{complaint.status}</td>

                    <td className="table-cell">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>

                    <td className="table-cell">
                       <div className="flex items-center gap-x-4">
                         <Link
                         
                           to={`/complaint-details/${complaint._id}`}
                        
                          className="text-green-500 hover:text-green-700"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </Link>


                       <Link to={`/edit-complaint/${complaint._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                                      <FilePenLine size={20} />
                                                  </Link>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Complaint"
                      >
                        <Trash size={20} />
                      </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td
                    colSpan="7"
                    className="table-cell text-center text-gray-500 py-4"
                  >
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageComplaints;


