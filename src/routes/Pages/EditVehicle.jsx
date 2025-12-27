import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [existingImages, setExistingImages] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    brand: "",
    model: "",
    color: "",
    registrationNumber: "",
    rcNumber: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    permitValidTill: "",
    capacity: 2,
    images: [],
    document: []
  });

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles/single/${id}`);
      const data = response.data;
      setFormData({
        type: data.type || "",
        brand: data.brand || "",
        model: data.model || "",
        color: data.color || "",
        registrationNumber: data.registrationNumber || "",
        rcNumber: data.rcNumber || "",
        insuranceNumber: data.insuranceNumber || "",
        insuranceExpiry: data.insuranceExpiry?.substring(0, 10) || "",
        permitValidTill: data.permitValidTill?.substring(0, 10) || "",
        capacity: data.capacity || 2,
        images: [],
        document: []
      });
      setExistingImages(data.images || []);
      setExistingDocuments(data.document || []);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch vehicle data", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "images") {
        const filesArray = Array.from(files);
        setNewImages(filesArray);
        setExistingImages([]); // Clear existing images when new ones are selected
      } else if (name === "document") {
        const filesArray = Array.from(files);
        setNewDocuments(filesArray);
        setExistingDocuments([]); // Clear existing documents when new ones are selected
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vehicleData = new FormData();

    for (let key in formData) {
      if (key !== "images" && key !== "document") {
        vehicleData.append(key, formData[key]);
      }
    }

    newImages.forEach((file) => vehicleData.append("images", file));
    newDocuments.forEach((file) => vehicleData.append("document", file));
    existingImages.forEach((img) => vehicleData.append("existingImages", img));
    existingDocuments.forEach((doc) => vehicleData.append("existingDocuments", doc));

    try {
      await axios.put(`${API_BASE_URL}/vehicles/update/${id}`, vehicleData);
      Swal.fire("Updated!", "Vehicle updated successfully", "success");
      navigate(-1);
    } catch (error) {
      Swal.fire("Error", "Failed to update vehicle", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-1 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Edit Vehicle</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type</label>
        <input type="text" name="type" placeholder="e.g., auto, bike, suv" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
            <input type="text" name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
            <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <input type="text" name="color" placeholder="Color" value={formData.color} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
            <input type="text" name="registrationNumber" placeholder="Registration Number" value={formData.registrationNumber} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RC Number</label>
            <input type="text" name="rcNumber" placeholder="RC Number" value={formData.rcNumber} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Number</label>
            <input type="text" name="insuranceNumber" placeholder="Insurance Number" value={formData.insuranceNumber} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Expiry</label>
            <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permit Valid Till</label>
            <input type="date" name="permitValidTill" value={formData.permitValidTill} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passenger Capacity</label>
        <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white" />


        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload New Images</label>
        <input type="file" name="images" onChange={handleChange} multiple className="block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white" />
        {newImages.length > 0 ? (
          <div className="mt-2 flex gap-3 flex-wrap">
            {newImages.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="w-24 h-20 object-cover rounded border"
              />
            ))}
          </div>
        ) : existingImages.length > 0 && (
          <div className="mt-2 flex gap-3 flex-wrap">
            {existingImages.map((img, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}/${img}`}
                alt={`img-${index}`}
                className="w-24 h-20 object-cover rounded border"
              />
            ))}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload New Documents</label>
        <input type="file" name="document" onChange={handleChange} multiple className="block w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white" />
        {newDocuments.length > 0 ? (
          <div className="mt-2 space-y-1">
            {newDocuments.map((doc, index) => (
              <div key={index} className="text-sm text-green-600">{doc.name}</div>
            ))}
          </div>
        ) : existingDocuments.length > 0 && (
          <div className="mt-2 space-y-1">
            {existingDocuments.map((doc, index) => (
              <a
                key={index}
                href={`${API_BASE_URL}/${doc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline block"
              >
                Document {index + 1}
              </a>
            ))}
          </div>
        )}

        <button type="submit" className="bg-primary text-white px-6 py-2 rounded">Update Vehicle</button>
      </form>
    </div>
  );
};

export default EditVehicle;