import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const ManageEducation = () => {
  const token = localStorage.getItem("authToken");
  const [educations, setEducations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/education`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEducations(response.data.educations);
    } catch (error) {
      console.error("Error fetching educations:", error);
      Swal.fire("Error", "Failed to fetch educations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This education will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/education/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEducations(educations.filter((edu) => edu._id !== id));
          Swal.fire("Deleted!", "Education has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting education:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredEducations = educations.filter(
    (edu) =>
      (edu.degree || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (edu.field || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading educations...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Education</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search education"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-soft pl-10"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addeducation"
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add Education
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Degree</th>
                <th className="table-head">Field</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredEducations.length > 0 ? (
                filteredEducations.map((edu, index) => (
                  <tr key={edu._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{edu.degree}</td>
                    <td className="table-cell">{edu.field || "-"}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-education/${edu._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(edu._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Education"
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
                    No educations found.
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

export default ManageEducation;


