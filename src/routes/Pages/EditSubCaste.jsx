import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const EditSubCaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 const token = localStorage.getItem("authToken");
  const [subCasteData, setSubCasteData] = useState({ name: "", caste: "" });
  const [castes, setCastes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubCasteAndCastes = async () => {
      try {
        const [subCasteResponse, castesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/subcast/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/cast`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSubCasteData(subCasteResponse.data.subCaste);
        setCastes(castesResponse.data.castes);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubCasteAndCastes();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubCasteData({ ...subCasteData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/subcast/${id}`, subCasteData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "SubCaste updated successfully!", "success");
      navigate("/subcaste");
    } catch (error) {
      console.error("Error updating subcaste:", error);
      Swal.fire("Error", "Failed to update subcaste.", "error");
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
        <h2 className="text-lg font-semibold">Edit SubCaste</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">SubCaste Name</label>
            <input type="text" name="name" value={subCasteData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Caste</label>
            <select name="caste" value={subCasteData.caste} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Select Caste</option>
              {castes.map(caste => (
                <option key={caste._id} value={caste._id}>{caste.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/subcaste")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update SubCaste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubCaste;
