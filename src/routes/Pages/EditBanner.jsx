import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const EditBanner = () => {
  const location = useLocation();
  const id = location.state?.bannerId; // Get the banner ID from the route parameters
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [type, setType] = useState(''); // Added type state
  const [imageFile, setImageFile] = useState(null); // For new image upload
  const [videoFile, setVideoFile] = useState(null); // For new video upload
  const [imagePreview, setImagePreview] = useState(null); // For new image preview
  const [videoPreview, setVideoPreview] = useState(null); // For new video preview
  const [existingImageUrl, setExistingImageUrl] = useState(''); // To display the current image
  const [existingVideoUrl, setExistingVideoUrl] = useState(''); // To display the current video
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
const token = localStorage.getItem("authToken");

  const resolveMediaUrl = (url = "") => {
    if (!url) return "";
    const cleaned = url.replace(/\\/g, "/").replace(/^\/+/, "");
    return cleaned.startsWith("http") ? cleaned : `${API_BASE_URL}/${cleaned}`;
  };

  useEffect(() => {
    const fetchBannerDetails = async () => {
      setFetchLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/banner/singlebanner/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const bannerData = response.data;
        setTitle(bannerData.title);
        setDescription(bannerData.description);
        setStatus(bannerData.status);
        setType(bannerData.type);
        if (bannerData.type === 'image') {
          setExistingImageUrl(resolveMediaUrl(bannerData.imageUrl));
        } else if (bannerData.type === 'video') {
          setExistingVideoUrl(resolveMediaUrl(bannerData.videoUrl));
        }
        setFetchLoading(false);
      } catch (error) {
        setFetchError('Failed to fetch banner details.');
        setFetchLoading(false);
      }
    };

    fetchBannerDetails();
  }, [id]);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === 'image') {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setVideoFile(null);
        setVideoPreview(null);
        setExistingVideoUrl(''); // Clear existing video if new image is uploaded
      } else if (fileType === 'video') {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(''); // Clear existing image if new video is uploaded
      }
    } else {
      if (fileType === 'image') {
        setImageFile(null);
        setImagePreview(null);
      } else if (fileType === 'video') {
        setVideoFile(null);
        setVideoPreview(null);
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
    formData.append('type', type);

    if (type === 'image') {
      if (imageFile) {
        formData.append('file', imageFile);
      }
    } else if (type === 'video') {
      if (videoFile) {
        formData.append('file', videoFile);
      }
    }

    try {
    const response=  await axios.put(`${API_BASE_URL}/api/banner/updatebanner/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data',Authorization: `Bearer ${token}`, },

      });
console.log(response)
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Offer Banner updated successfully!',
      });

      navigate(-1); // Go back to the previous page
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update Offer Banner. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="max-w-6xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow">Loading banner details...</div>;
  }

  if (fetchError) {
    return <div className="max-w-6xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow text-red-500">{fetchError}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Banner</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* You can add more fields here if needed */}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     dark:bg-gray-700 dark:text-white"
          ></textarea>
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
              setExistingImageUrl('');
              setExistingVideoUrl('');
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
            <label className="block text-sm font-medium text-gray-700">Upload New Banner Image (Optional)</label>
            {existingImageUrl && !imageFile && (
              <div className="mb-2">
                <img src={existingImageUrl} alt="Current Banner" className="w-40 h-auto rounded" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {type === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload New Banner Video (Optional)</label>
            {existingVideoUrl && !videoFile && (
              <div className="mb-2">
                <video src={existingVideoUrl} controls className="w-40 h-auto rounded" />
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {imagePreview && type === 'image' && (
          <div className="flex justify-center">
            <img src={imagePreview} alt="New Banner Preview" className="w-40 h-auto rounded" />
          </div>
        )}

        {videoPreview && type === 'video' && (
          <div className="flex justify-center">
            <video src={videoPreview} controls className="w-40 h-auto rounded" />
          </div>
        )}

        <button type="submit" disabled={loading} className="w-40 bg-primary text-white py-2 rounded ">
          {loading ? 'Updating...' : 'Update Banner'}
        </button>
      </form>
    </div>
  );
};

export default EditBanner;


