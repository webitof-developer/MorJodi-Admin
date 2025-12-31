import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
   const token = localStorage.getItem("authToken");
  const [locationData, setLocationData] = useState({ city: "", state: "", country: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/location/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocationData(response.data.location);
      } catch (error) {
        console.error("Error fetching location:", error);
        Swal.fire("Error", "Failed to fetch location data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocationData({ ...locationData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/location/${id}`, locationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Location updated successfully!", "success");
      navigate("/location");
    } catch (error) {
      console.error("Error updating location:", error);
      Swal.fire("Error", "Failed to update location.", "error");
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
        <h2 className="text-lg font-semibold">Edit Location</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input type="text" name="city" value={locationData.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input type="text" name="state" value={locationData.state} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input type="text" name="country" value={locationData.country} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/location")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocation;


