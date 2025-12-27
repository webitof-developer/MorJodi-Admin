import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../../components/Config";
import Swal from 'sweetalert2';

const AddBanner = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [type, setType] = useState(''); // Added type state
  const [imageFile, setImageFile] = useState(null); // Renamed from image
  const [videoFile, setVideoFile] = useState(null); // Added videoFile state
  const [imagePreview, setImagePreview] = useState(null); // Renamed from preview
  const [videoPreview, setVideoPreview] = useState(null); // Added videoPreview state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === 'image') {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setVideoFile(null);
        setVideoPreview(null);
      } else if (fileType === 'video') {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setImageFile(null);
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('type', type); // Append type

    if (type === 'image' && imageFile) {
      formData.append('file', imageFile); // Use 'file' as the key
    } else if (type === 'video' && videoFile) {
      formData.append('file', videoFile); // Use 'file' as the key
    }
   

  try {
  await axios.post(`${API_BASE_URL}/api/banner/addbanner`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: 'Offer Banner Created successfully!',
  });

  setTitle('');
  setDescription('');
  setStatus('active');
  setType('');
  setImageFile(null);
  setVideoFile(null);
  setImagePreview(null);
  setVideoPreview(null);
  navigate(-1);
} catch (error) {
  console.error("❌ Banner Upload Error:", error.response?.data || error.message);
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text:
      error.response?.data?.message ||
      'Failed to create Offer Banner. Please try again.',
  });
} finally {
  setLoading(false);
}

  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Banner</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div  className="grid grid-cols-2 gap-4">
            <div>
          <label className="block text-gray-700 dark:text-gray-300">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required   className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary  
                dark:bg-gray-700 dark:text-white"/>
          </div>
          <div>
          <label className="block text-gray-700 dark:text-gray-300">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary  
                dark:bg-gray-700 dark:text-white">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        </div>
        <div  className="grid grid-cols-2 gap-4">
       
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required  className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary  
                dark:bg-gray-700 dark:text-white"></textarea>
        </div>

        {/* Banner Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Banner Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setImageFile(null);
              setVideoFile(null);
              setImagePreview(null);
              setVideoPreview(null);
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="">Select Type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Banner Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')}  className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary  
                  dark:bg-gray-700 dark:text-white" />
          </div>
        )}

        {type === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Banner Video</label>
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')}  className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary  
                  dark:bg-gray-700 dark:text-white" />
          </div>
        )}

        {imagePreview && type === 'image' && (
          <div className="flex ">
            <img src={imagePreview} alt="Banner Preview" className="w-40 h-auto rounded" />
          </div>
        )}

        {videoPreview && type === 'video' && (
          <div className="flex ">
            <video src={videoPreview} controls className="w-40 h-auto rounded" />
          </div>
        )}

        <button type="submit" disabled={loading} className="w-40 bg-primary text-white py-2 rounded ">
          {loading ? 'Loading...' : 'Add Banner'}
        </button>
      </form>
    </div>
  );
};

export default AddBanner;
