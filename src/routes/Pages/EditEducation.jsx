import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditEducation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [educationData, setEducationData] = useState({ degree: "", field: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/education/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEducationData(response.data.edu);
      } catch (error) {
        console.error("Error fetching education:", error);
        Swal.fire("Error", "Failed to fetch education data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEducation();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEducationData({ ...educationData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/education/${id}`, educationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Education updated successfully!", "success");
      navigate("/education");
    } catch (error) {
      console.error("Error updating education:", error);
      Swal.fire("Error", "Failed to update education.", "error");
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
        <h2 className="text-lg font-semibold">Edit Education</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <input type="text" name="degree" value={educationData.degree} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Field</label>
            <input type="text" name="field" value={educationData.field} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/education")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Education'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEducation;


