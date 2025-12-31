import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditMotherTongue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMotherTongue = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/mothertongue/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(response.data.motherTongue.name);
      } catch (error) {
        console.error("Error fetching mother tongue:", error);
        Swal.fire("Error", "Failed to fetch mother tongue data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMotherTongue();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/mothertongue/${id}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Mother Tongue updated successfully!", "success");
      navigate("/mothertongue");
    } catch (error) {
      console.error("Error updating mother tongue:", error);
      Swal.fire("Error", "Failed to update mother tongue.", "error");
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
        <h2 className="text-lg font-semibold">Edit Mother Tongue</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mother Tongue Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/mothertongue")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Mother Tongue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMotherTongue;


