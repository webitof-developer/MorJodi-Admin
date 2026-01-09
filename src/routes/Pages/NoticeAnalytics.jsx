import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../components/Config';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IconArrowLeft, IconEye, IconClick, IconClock, IconCheck } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';

const NoticeAnalytics = () => {
    const { id } = useParams();
    const token = localStorage.getItem("authToken");
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('views'); // views, clicks, reminders, completions

    useEffect(() => {
        fetchAnalytics();
    }, [id]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/notice/${id}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotice(res.data);
        } catch (error) {
            toast.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;
    if (!notice) return <div className="p-10 text-center">Notice not found</div>;

    const stats = notice.stats || {};
    const views = stats.views || [];
    const clicks = stats.clicks || [];
    const reminders = stats.reminders || [];
    const completions = stats.completions || [];

    const getList = () => {
        switch (activeTab) {
            case 'views': return views;
            case 'clicks': return clicks;
            case 'reminders': return reminders;
            case 'completions': return completions;
            default: return [];
        }
    };

    const currentList = getList();

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans text-slate-800">
            <ToastContainer />
            <div className="flex items-center gap-4 mb-6">
                <Link to="/notices/list" className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary transition">
                    <IconArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Notice Analytics</h1>
                    <p className="text-gray-500 text-sm">{notice.title}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Views"
                    count={views.length}
                    icon={<IconEye />}
                    color="blue"
                    active={activeTab === 'views'}
                    onClick={() => setActiveTab('views')}
                />
                <StatCard
                    label="Clicks (Action)"
                    count={clicks.length}
                    icon={<IconClick />}
                    color="green"
                    active={activeTab === 'clicks'}
                    onClick={() => setActiveTab('clicks')}
                />
                <StatCard
                    label="Remind Later"
                    count={reminders.length}
                    icon={<IconClock />}
                    color="orange"
                    active={activeTab === 'reminders'}
                    onClick={() => setActiveTab('reminders')}
                />
                <StatCard
                    label="Task Completed"
                    count={completions.length}
                    icon={<IconCheck />}
                    color="purple"
                    active={activeTab === 'completions'}
                    onClick={() => setActiveTab('completions')}
                />
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold capitalize text-gray-700">User List - {activeTab}</h3>
                    <span className="text-xs text-gray-400">Total: {currentList.length}</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0">
                            <tr>
                                <th className="p-3">User Name</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Action Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentList.length === 0 ? (
                                <tr><td colSpan="3" className="p-6 text-center text-gray-400">No data available</td></tr>
                            ) : currentList.map((user, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">
                                        {user?.fullName || 'Unknown User'}
                                    </td>
                                    <td className="p-3 text-gray-600">{user?.phoneNumber || '-'}</td>
                                    <td className="p-3 text-xs text-gray-400">
                                        {/* Mongoose population doesn't give timestamp of the Push to Array, only User object. 
                                            The Schema stored ObjectIDs. We don't have timestamp of the event unless we change Schema to store {user: ID, date: Date}. 
                                            For current plan, we only have User details. */}
                                        -
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, count, icon, color, active, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${active ? colorClasses[color] : 'bg-white border-transparent shadow hover:shadow-md'}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${active ? 'bg-white/50' : 'bg-gray-100'}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <span className="text-2xl font-bold">{count}</span>
            </div>
            <p className="text-sm font-medium opacity-80">{label}</p>
        </div>
    );
};

export default NoticeAnalytics;
