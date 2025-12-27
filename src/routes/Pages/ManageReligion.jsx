import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageReligion = () => {
   const token = localStorage.getItem("authToken");
  const [religions, setReligions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/religion`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReligions(response.data.religions);
    } catch (error) {
      console.error("Error fetching religions:", error);
      Swal.fire("Error", "Failed to fetch religions.", "error");
    } finally {
      setLoading(false);
    }
  };

 

  const handleDelete = async (religionId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This religion will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/religion/${religionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReligions(religions.filter((r) => r._id !== religionId));
          Swal.fire("Deleted!", "Religion has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting religion:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredReligions = religions.filter((r) =>
    (r.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading religions...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Religions</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search religion"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
                        to="/addreligion"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                        hover:bg-gray-100 dark:hover:bg-gray-700 
                        text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add Religion
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Religion Name</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredReligions.length > 0 ? (
                filteredReligions.map((religion, index) => (
                  <tr key={religion._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{religion.name}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-religion/${religion._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(religion._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Religion"
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
                    No religions found.
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

export default ManageReligion;