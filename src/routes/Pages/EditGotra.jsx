import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditGotra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [gotraData, setGotraData] = useState({ name: "", subCaste: "", isVerified: true });
  const [subCastes, setSubCastes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGotraAndSubCastes = async () => {
      try {
        const [gotraResponse, subCastesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/gotra/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/subcast`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const gotra = gotraResponse.data;
        setGotraData({
          name: gotra.name || "",
          subCaste: gotra.subCaste?._id || "",
          isVerified: gotra.isVerified !== undefined ? gotra.isVerified : true,
        });
        setSubCastes(subCastesResponse.data.subCastes);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchGotraAndSubCastes();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGotraData({ ...gotraData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/gotra/${id}`, gotraData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Gotra updated successfully!", "success");
      navigate("/gotra"); // Navigate to manage gotra page
    } catch (error) {
      console.error("Error updating gotra:", error);
      Swal.fire("Error", "Failed to update gotra.", "error");
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
        <h2 className="text-lg font-semibold">Edit Gotra</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Gotra Name</label>
            <input type="text" name="name" value={gotraData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">SubCaste</label>
            <select name="subCaste" value={gotraData.subCaste} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Select SubCaste</option>
              {subCastes.map(subCaste => (
                <option key={subCaste._id} value={subCaste._id}>{subCaste.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Verification Status</label>
            <select
              name="isVerified"
              value={gotraData.isVerified}
              onChange={(e) => setGotraData({ ...gotraData, isVerified: e.target.value === 'true' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="true">Verified</option>
              <option value="false">Under Review</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/gotra")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#f8f9fa] shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Gotra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGotra;


