import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { Trash, Search, PlusCircle, FilePenLine } from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const ManageLocation = () => {
   const token = localStorage.getItem("authToken");
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/location`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data.locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Swal.fire("Error", "Failed to fetch locations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (locationId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This location will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/location/${locationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocations(locations.filter((loc) => loc._id !== locationId));
          Swal.fire("Deleted!", "Location has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting location:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredLocations = locations.filter((loc) =>
    (loc.city || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading locations...</div>;

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Locations</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-soft pl-10"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addlocation"
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add Location
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">City</th>
                <th className="table-head">State</th>
                <th className="table-head">Country</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <tr key={loc._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{loc.city}</td>
                    <td className="table-cell">{loc.state}</td>
                    <td className="table-cell">{loc.country}</td>
                    <td className="table-cell">
                        <div className="flex items-center gap-x-4">
                            <Link to={`/edit-location/${loc._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                                <FilePenLine size={20} />
                            </Link>
                            <button
                                onClick={() => handleDelete(loc._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Location"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="5" className="table-cell text-center text-gray-500">
                    No locations found.
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

export default ManageLocation;


