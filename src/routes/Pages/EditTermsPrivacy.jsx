import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const EditTermsPrivacy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [termsPrivacyData, setTermsPrivacyData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsPrivacy = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/term/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTermsPrivacyData(response.data.data);
      } catch (error) {
        console.error("Error fetching Terms & Privacy:", error);
        Swal.fire("Error", "Failed to fetch Terms & Privacy data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTermsPrivacy();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTermsPrivacyData({ ...termsPrivacyData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/term/${id}`, termsPrivacyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Terms & Privacy updated successfully!", "success");
      navigate("/terms-privacy");
    } catch (error) {
      console.error("Error updating Terms & Privacy:", error);
      Swal.fire("Error", "Failed to update Terms & Privacy.", "error");
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
        <h2 className="text-lg font-semibold">Edit Terms & Privacy</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={termsPrivacyData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea name="content" value={termsPrivacyData.content} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="8"></textarea>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/terms-privacy")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Terms & Privacy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTermsPrivacy;