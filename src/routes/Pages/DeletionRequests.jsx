import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { useNavigate } from "react-router-dom";

const DeletionRequests = () => {
  const token = localStorage.getItem('authToken');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeletionRequests();
  }, []);

  const fetchDeletionRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/deletion-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequests(response.data.requests);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch deletion requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading deletion requests...</div>;

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">
          Deletion Requests
        </h2>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Name</th>
                <th className="table-head">Email</th>
                <th className="table-head">Reason</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>

            <tbody className="table-body">
              {requests.length > 0 ? (
                requests.map((request, index) => (
                  <tr key={request._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{request.user?.fullName}</td>
                    <td className="table-cell">{request.user?.email}</td>
                    <td className="table-cell">{request.reason}</td>

                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        {/* 🔍 View Details */}
                        <button
                          onClick={() =>
                            navigate(`/deletion-request-details/${request._id}`)
                          }
                          className="text-blue-500 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="5" className="table-cell text-center text-gray-500">
                    No deletion requests found.
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

export default DeletionRequests;
