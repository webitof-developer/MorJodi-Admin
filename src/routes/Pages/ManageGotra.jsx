import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const ManageGotra = () => {
  const token = localStorage.getItem("authToken");
  const [gotras, setGotras] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGotras();
  }, []);

  const fetchGotras = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gotra`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setGotras(response.data);
    } catch (error) {
      console.error("Error fetching gotras:", error);
      Swal.fire("Error", "Failed to fetch gotras.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gotraId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This gotra will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/gotra/${gotraId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGotras(gotras.filter((g) => g._id !== gotraId));
          Swal.fire("Deleted!", "Gotra has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting gotra:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredGotras = gotras.filter((g) =>
    (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.subCaste?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading gotras...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Gotras</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gotra"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addgotra"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                        hover:bg-gray-100 dark:hover:bg-gray-700 
                        text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add Gotra
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Gotra Name</th>
                <th className="table-head">SubCaste Name</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredGotras.length > 0 ? (
                filteredGotras.map((gotra, index) => (
                  <tr key={gotra._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{gotra.name}</td>
                    <td className="table-cell">{gotra.subCaste?.name || "-"}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-gotra/${gotra._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(gotra._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Gotra"
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
                    No gotras found.
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

export default ManageGotra;