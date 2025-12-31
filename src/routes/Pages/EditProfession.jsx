import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditProfession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [professionData, setProfessionData] = useState({ occupation: "", industry: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfession = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profession/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessionData(response.data.profession);
      } catch (error) {
        console.error("Error fetching profession:", error);
        Swal.fire("Error", "Failed to fetch profession data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfession();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfessionData({ ...professionData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/profession/${id}`, professionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Profession updated successfully!", "success");
      navigate("/profession");
    } catch (error) {
      console.error("Error updating profession:", error);
      Swal.fire("Error", "Failed to update profession.", "error");
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
        <h2 className="text-lg font-semibold">Edit Profession</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Occupation</label>
            <input type="text" name="occupation" value={professionData.occupation} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input type="text" name="industry" value={professionData.industry} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/profession")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Profession'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfession;


