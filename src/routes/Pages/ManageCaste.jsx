import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageCaste = () => {
  const token = localStorage.getItem("authToken");
  const [casts, setCasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cast`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      setCasts(response.data.castes);
    } catch (error) {
      console.error("Error fetching casts:", error);
      Swal.fire("Error", "Failed to fetch casts.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (castId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This cast will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/cast/${castId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCasts(casts.filter((c) => c._id !== castId));
          Swal.fire("Deleted!", "Cast has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting cast:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredCasts = casts.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading casts...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Casts</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cast"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addcaste"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add Cast
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Cast Name</th>
                  <th className="table-head">Category</th>
                   <th className="table-head">Religion</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredCasts.length > 0 ? (
                filteredCasts.map((cast, index) => (
                  <tr key={cast._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{cast.name}</td>
                     <td className="table-cell">{cast.category}</td>
                       <td className="table-cell">{cast.religion.name}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-caste/${cast._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(cast._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Cast"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="3" className="table-cell text-center text-gray-500">
                    No casts found.
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

export default ManageCaste;