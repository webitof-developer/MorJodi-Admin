import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import LoadingState from "../../components/LoadingState";
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
    return <LoadingState label="Loading religions..." rows={6} />;
  }

  return (
    <div className="card">
      <div className="card-header flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Directory</p>
          <h2 className="text-xl font-semibold dark:text-white">Manage Religions</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search religion"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-soft"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          </div>
          <Link to="/addreligion" className="btn-primary">
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
                <th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredReligions.length > 0 ? (
                filteredReligions.map((religion, index) => (
                  <tr key={religion._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{religion.name}</td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/edit-religion/${religion._id}`}
                          className="action-icon"
                          title="Edit"
                        >
                          <FilePenLine size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(religion._id)}
                          className="action-icon text-red-500 hover:text-red-600 hover:border-red-200"
                          title="Delete Religion"
                        >
                          <Trash size={18} />
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


