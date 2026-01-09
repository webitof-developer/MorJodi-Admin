import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../components/Config';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns';
import { IconBell, IconPlus, IconTrash, IconEdit, IconChartBar } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/notice/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
        } catch (error) {
            toast.error("Failed to fetch notices");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/notice/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Notice deleted");
            fetchNotices();
        } catch (error) {
            toast.error("Failed to delete notice");
        }
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans text-slate-800">
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <IconBell className="w-8 h-8 text-primary" />
                    Notice Management
                </h1>
                <Link
                    to="/add-notice"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <IconPlus size={20} /> Create New Notice
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Target Audience</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {notices.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">No notices found.</td>
                                </tr>
                            ) : notices.map((notice) => (
                                <tr key={notice._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium">{notice.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${notice.status === 'published' ? 'bg-green-100 text-green-700' :
                                            notice.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {notice.status}
                                        </span>
                                        {notice.isForced && (
                                            <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                Forced
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {/* Summarize targeting */}
                                        <div className="flex flex-col gap-1">
                                            <span>Gender: {notice.targetRules?.gender}</span>
                                            <span>Plan: {notice.targetRules?.membershipType}</span>
                                            {notice.targetRules?.missingFields?.length > 0 && (
                                                <span className="text-red-500 text-xs">Missing: {notice.targetRules.missingFields.join(', ')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {format(new Date(notice.createdAt), 'dd MMM yyyy')}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <Link to={`/notice-analytics/${notice._id}`} className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition" title="Analytics">
                                            <IconChartBar size={18} />
                                        </Link>
                                        <Link to={`/edit-notice/${notice._id}`} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition" title="Edit">
                                            <IconEdit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(notice._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition" title="Delete">
                                            <IconTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageNotices;
