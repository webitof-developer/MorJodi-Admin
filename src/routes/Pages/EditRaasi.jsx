import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const EditRaasi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 const token = localStorage.getItem("authToken");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaasi = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/raasi/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(response.data.raasi.name);
      } catch (error) {
        console.error("Error fetching Raasi:", error);
        Swal.fire("Error", "Failed to fetch Raasi data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRaasi();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/raasi/${id}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Raasi updated successfully!", "success");
      navigate("/raasi");
    } catch (error) {
      console.error("Error updating Raasi:", error);
      Swal.fire("Error", "Failed to update Raasi.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold">Edit Raasi</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Raasi Name</label>
            <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/raasi")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Raasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRaasi;
