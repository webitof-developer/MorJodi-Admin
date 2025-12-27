import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageAdvertising = () => {
  const token = localStorage.getItem("authToken");
  const [advertisings, setAdvertisings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to strip HTML tags
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    fetchAdvertisings();
  }, []);

  const fetchAdvertisings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/advertising`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdvertisings(response.data);
    } catch (error) {
      console.error("Error fetching advertisings:", error);
      Swal.fire("Error", "Failed to fetch advertisings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (advertisingId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This advertising will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/advertising/${advertisingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdvertisings(advertisings.filter((adv) => adv._id !== advertisingId));
          Swal.fire("Deleted!", "Advertising has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting advertising:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredAdvertisings = advertisings.filter((adv) =>
    (adv.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (adv.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (adv.link || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading advertisings...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Advertisings</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search advertising"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/add-advertising"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                        hover:bg-gray-100 dark:hover:bg-gray-700 
                        text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add Advertising
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Type</th>
                <th className="table-head">Content/Image</th>
                <th className="table-head">Link</th>
                <th className="table-head">Start Date</th>
                <th className="table-head">End Date</th>
                <th className="table-head">Active</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredAdvertisings.length > 0 ? (
                filteredAdvertisings.map((adv, index) => (
                  <tr key={adv._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{adv.type}</td>
                    <td className="table-cell">
                      {adv.type === "content" ? (
                        stripHtml(adv.content)
                      ) : adv.type === "image" ? (
                        <img src={adv.imageUrl} alt="Ad" className="w-20 h-auto" />
                      ) : adv.type === "video" ? (
                        <video controls className="w-20 h-auto">
                          <source src={adv.videoUrl} />
                        </video>
                      ) : null}
                    </td>
                    <td className="table-cell">{adv.link}</td>
                    <td className="table-cell">{new Date(adv.startDate).toLocaleDateString()}</td>
                    <td className="table-cell">{new Date(adv.endDate).toLocaleDateString()}</td>
                    <td className="table-cell">{adv.isActive ? "Yes" : "No"}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        <Link to={`/edit-advertising/${adv._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                            <FilePenLine size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(adv._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Advertising"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="8" className="table-cell text-center text-gray-500">No advertisings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAdvertising;
