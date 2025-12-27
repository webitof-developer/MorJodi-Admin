import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const EditFollow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [followData, setFollowData] = useState({
    platform: "",
    link: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollow = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/follow/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowData(response.data);
      } catch (error) {
        console.error("Error fetching follow link:", error);
        Swal.fire("Error", "Failed to fetch follow link data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFollow();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFollowData({ ...followData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/follow/${id}`, followData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Link updated successfully!", "success");
      navigate("/follow");
    } catch (error) {
      console.error("Error updating link:", error);
      Swal.fire("Error", "Failed to update link.", "error");
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
        <h2 className="text-lg font-semibold">Edit Follow Us Link</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <input type="text" name="platform" value={followData.platform} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Link</label>
                <input type="text" name="link" value={followData.link} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/follow")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFollow;
