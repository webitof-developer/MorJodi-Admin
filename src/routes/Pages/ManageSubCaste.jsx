import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import LoadingState from "../../components/LoadingState";

const ManageSubCaste = () => {
 const token = localStorage.getItem("authToken");
  const [subCastes, setSubCastes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubCastes();
  }, []);

  const fetchSubCastes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subcast`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setSubCastes(response.data.subCastes);
    } catch (error) {
      console.error("Error fetching subcastes:", error);
      Swal.fire("Error", "Failed to fetch subcastes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subCasteId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This subcaste will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/subcast/${subCasteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSubCastes(subCastes.filter((s) => s._id !== subCasteId));
          Swal.fire("Deleted!", "SubCaste has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting subcaste:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredSubCastes = subCastes.filter((s) =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.caste?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState label="Loading subcastes..." rows={6} />;
  }

  return (
    <div className="card">
      <div className="card-header flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Directory</p>
          <h2 className="text-xl font-semibold dark:text-white">Manage SubCastes</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search subcaste"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-soft"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          </div>
          <Link to="/addsubcaste" className="btn-primary">
            <PlusCircle size={18} /> Add SubCaste
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">SubCaste Name</th>
                <th className="table-head">Caste Name</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredSubCastes.length > 0 ? (
                filteredSubCastes.map((sub, index) => (
                  <tr key={sub._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{sub.name}</td>
                    <td className="table-cell">{sub.caste?.name || "-"}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-subcaste/${sub._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(sub._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete SubCaste"
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
                    No subcastes found.
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

export default ManageSubCaste;


