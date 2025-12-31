import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageFollow = () => {
  const token = localStorage.getItem("authToken");
  const [follows, setFollows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollows();
  }, []);

  const fetchFollows = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/follow`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFollows(response.data);
    } catch (error) {
      console.error("Error fetching follows:", error);
      Swal.fire("Error", "Failed to fetch follows.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (followId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This link will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/follow/${followId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFollows(follows.filter((f) => f._id !== followId));
          Swal.fire("Deleted!", "Link has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting link:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredFollows = follows.filter((follow) =>
    (follow.platform || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Follow Us Links</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by platform"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-soft pl-10"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/add-follow"
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add Link
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Platform</th>
                <th className="table-head">Link</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredFollows.length > 0 ? (
                filteredFollows.map((follow, index) => (
                  <tr key={follow._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{follow.platform}</td>
                    <td className="table-cell">{follow.link}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-follow/${follow._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(follow._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Link"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="4" className="table-cell text-center text-gray-500">
                    No links found.
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

export default ManageFollow;


