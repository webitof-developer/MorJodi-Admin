import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageAbout = () => {
 const token = localStorage.getItem("authToken");
  const [aboutSections, setAboutSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/about`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAboutSections(response.data.data);
    } catch (error) {
      console.error("Error fetching About sections:", error);
      Swal.fire("Error", "Failed to fetch About sections.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (aboutId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This About section will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/about/${aboutId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAboutSections(aboutSections.filter((section) => section._id !== aboutId));
          Swal.fire("Deleted!", "About section has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting About section:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredAboutSections = aboutSections.filter((section) =>
    (section.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading About sections...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage About Sections</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search About section"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addabout"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
              hover:bg-gray-100 dark:hover:bg-gray-700 
              text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add About Section
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Title</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredAboutSections.length > 0 ? (
                filteredAboutSections.map((section, index) => (
                  <tr key={section._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{section.title}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-about/${section._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(section._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete About Section"
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
                    No About sections found.
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

export default ManageAbout;