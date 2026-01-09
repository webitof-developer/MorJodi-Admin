import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditAbout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 const token = localStorage.getItem("authToken");
  const [aboutData, setAboutData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/about/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAboutData(response.data.data);
      } catch (error) {
        console.error("Error fetching about section:", error);
        Swal.fire("Error", "Failed to fetch about section data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData({ ...aboutData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/about/${id}`, aboutData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "About section updated successfully!", "success");
      navigate("/about");
    } catch (error) {
      console.error("Error updating about section:", error);
      Swal.fire("Error", "Failed to update about section.", "error");
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
        <h2 className="text-lg font-semibold">Edit About Section</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={aboutData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={aboutData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="4"></textarea>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/about")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#f8f9fa] shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update About Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAbout;


