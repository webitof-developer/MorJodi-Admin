import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const EditCaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 const token = localStorage.getItem("authToken");
  const [casteData, setCasteData] = useState({ name: "", category: "", religion: "" });
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCasteAndReligions = async () => {
      try {
        const [casteResponse, religionsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cast/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/religion`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCasteData(casteResponse.data.caste);
        setReligions(religionsResponse.data.religions);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCasteAndReligions();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCasteData({ ...casteData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/cast/${id}`, casteData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Caste updated successfully!", "success");
      navigate("/caste");
    } catch (error) {
      console.error("Error updating caste:", error);
      Swal.fire("Error", "Failed to update caste.", "error");
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
        <h2 className="text-lg font-semibold">Edit Caste</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Caste Name</label>
            <input type="text" name="name" value={casteData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" name="category" value={casteData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Religion</label>
            <select name="religion" value={casteData.religion} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Select Religion</option>
              {religions.map(religion => (
                <option key={religion._id} value={religion._id}>{religion.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/caste")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Caste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCaste;
