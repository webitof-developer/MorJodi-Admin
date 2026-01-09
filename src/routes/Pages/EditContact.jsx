import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 const token = localStorage.getItem("authToken");
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
    address: "",
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
    pinterest: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContactData(response.data.data);
      } catch (error) {
        console.error("Error fetching contact:", error);
        Swal.fire("Error", "Failed to fetch contact data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/contact/${id}`, contactData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Contact updated successfully!", "success");
      navigate("/contact");
    } catch (error) {
      console.error("Error updating contact:", error);
      Swal.fire("Error", "Failed to update contact.", "error");
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
        <h2 className="text-lg font-semibold">Edit Contact Information</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold mb-4">Basic Contact</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={contactData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" value={contactData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={contactData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="3"></textarea>
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-4">Social Media & Website</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Facebook</label>
                <input type="text" name="facebook" value={contactData.facebook} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input type="text" name="instagram" value={contactData.instagram} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">YouTube</label>
                <input type="text" name="youtube" value={contactData.youtube} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Twitter</label>
                <input type="text" name="twitter" value={contactData.twitter} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input type="text" name="linkedin" value={contactData.linkedin} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Pinterest</label>
                <input type="text" name="pinterest" value={contactData.pinterest} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input type="text" name="website" value={contactData.website} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => navigate("/contact")} className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#f8f9fa] shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Updating...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContact;


