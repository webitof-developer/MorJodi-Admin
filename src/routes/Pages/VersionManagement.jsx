import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../components/Config';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns';
import { IconDeviceMobile, IconPlus, IconTrash, IconEdit, IconEye, IconChartBar } from '@tabler/icons-react';

const VersionManagement = () => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

    const [formData, setFormData] = useState({
        version: '',
        title: '',
        changelog: '',
        isForceUpdate: false,
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.morjodi',
        status: 'draft'
    });

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/app-version/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVersions(res.data);
        } catch (error) {
            toast.error("Failed to fetch versions");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`${API_BASE_URL}/api/app-version/${selectedVersion._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Version updated successfully");
            } else {
                await axios.post(`${API_BASE_URL}/api/app-version`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Version created successfully");
            }
            setShowModal(false);
            fetchVersions();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this version?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/app-version/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Version deleted");
            fetchVersions();
        } catch (error) {
            toast.error("Failed to delete version");
        }
    };

    const openEditModal = (ver) => {
        setFormData({
            version: ver.version,
            title: ver.title,
            changelog: ver.changelog,
            isForceUpdate: ver.isForceUpdate,
            playStoreUrl: ver.playStoreUrl,
            status: ver.status
        });
        setSelectedVersion(ver);
        setIsEdit(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            version: '',
            title: '',
            changelog: '',
            isForceUpdate: false,
            playStoreUrl: 'https://play.google.com/store/apps/details?id=com.morjodi',
            status: 'draft'
        });
        setIsEdit(false);
        setSelectedVersion(null);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <IconDeviceMobile className="w-8 h-8 text-primary" />
                    App Version Management
                </h1>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <IconPlus size={20} /> Create New Version
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm font-semibold">
                            <tr>
                                <th className="p-4">Version</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Force Update</th>
                                <th className="p-4">Published At</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {versions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-gray-500">No versions found.</td>
                                </tr>
                            ) : versions.map((ver) => (
                                <tr key={ver._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">{ver.version}</td>
                                    <td className="p-4 text-gray-700 dark:text-gray-300">{ver.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ver.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {ver.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {ver.isForceUpdate ? (
                                            <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">YES</span>
                                        ) : (
                                            <span className="text-gray-500 text-xs">Optional</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {ver.publishedAt ? format(new Date(ver.publishedAt), 'dd MMM yyyy HH:mm') : '-'}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button onClick={() => window.location.href = `/update-analytics?version=${ver.version}`} className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition" title="View Analytics">
                                            <IconChartBar size={18} />
                                        </button>
                                        <button onClick={() => openEditModal(ver)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition" title="Edit">
                                            <IconEdit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(ver._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition" title="Delete">
                                            <IconTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                {isEdit ? 'Edit Version' : 'Create New Version'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="versionForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version Number</label>
                                        <input
                                            type="text"
                                            name="version"
                                            placeholder="e.g. 1.0.2"
                                            required
                                            value={formData.version}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="e.g. Major Update"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Play Store URL hidden/internal */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Changelog (Description)</label>
                                    <textarea
                                        name="changelog"
                                        rows="4"
                                        required
                                        value={formData.changelog}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Force Update?</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="isForceUpdate" checked={formData.isForceUpdate} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f8f9fa] shadow-sm after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                            <button type="submit" form="versionForm" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg shadow-lg transform active:scale-95 transition">
                                {isEdit ? 'Update Version' : 'Create Version'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VersionManagement;
