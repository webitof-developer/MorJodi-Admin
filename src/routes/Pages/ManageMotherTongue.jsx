import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Trash, Search, PlusCircle ,Edit} from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const ManageMotherTongue = () => {
 const token = localStorage.getItem("authToken");
  const [motherTongues, setMotherTongues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMotherTongues();
  }, []);

  const fetchMotherTongues = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mothertongue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setMotherTongues(response.data.motherTongues);
    } catch (error) {
      console.error("Error fetching mother tongues:", error);
      Swal.fire("Error", "Failed to fetch mother tongues.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data.success) setSettings(res.data.settings);
      } catch (err) {
        console.log("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This mother tongue will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/mothertongue/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMotherTongues(motherTongues.filter((m) => m._id !== id));
          Swal.fire("Deleted!", "Mother Tongue has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting mother tongue:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredMotherTongues = motherTongues.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading mother tongues...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">Manage Mother Tongues</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search mother tongue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <Link
            to="/addmothertongue"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white"
          >
            <PlusCircle size={18} /> Add Mother Tongue
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Mother Tongue Name</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredMotherTongues.length > 0 ? (
                filteredMotherTongues.map((m, index) => (
                  <tr key={m._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{m.name}</td>
                    <td className="table-cell">
     <div className="flex gap-2">
                       <Link to={`/edit-mothertongue/${m._id}`} title="Edit Plan">
                                                <Edit
                                                  size={20}
                                                  className="text-blue-500 hover:text-blue-700"
                                                />
                                              </Link> 
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Mother Tongue"
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
                    No mother tongues found.
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

export default ManageMotherTongue;
