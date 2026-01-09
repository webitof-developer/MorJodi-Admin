import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../components/Config';
import { IconChartBar, IconDeviceMobile, IconMouse, IconRefresh } from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const UpdateAnalytics = () => {
    const [data, setData] = useState({ totalEvents: 0, actionDistribution: [] });
    const [breakdown, setBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("authToken");

    const queryParams = new URLSearchParams(window.location.search);
    const versionFilter = queryParams.get('version');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [resOverview, resBreakdown] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/analytics/app-update`, {
                    params: { version: versionFilter },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/analytics/app-update/breakdown`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setData(resOverview.data || { totalEvents: 0, actionDistribution: [] });
            setBreakdown(resBreakdown.data || []);
        } catch (error) {
            console.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // Transform actionDistribution for chart
    const pieData = (data.actionDistribution || []).map((item) => ({
        name: item._id,
        value: item.count
    }));

    // Helper to safely get value from stats object
    const getStat = (stats, key) => stats && stats[key] ? stats[key] : 0;

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <IconChartBar className="w-8 h-8 text-primary" />
                    {versionFilter ? `Update Analytics: v${versionFilter}` : 'Update Analytics (All Time)'}
                </h1>
                <button onClick={fetchAnalytics} className="p-2 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 transition">
                    <IconRefresh size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Events"
                    value={data.totalEvents}
                    icon={<IconDeviceMobile size={24} className="text-blue-500" />}
                />
                <StatCard
                    title="Shown Popups"
                    value={pieData.find(d => d.name === 'popup_shown')?.value || 0}
                    icon={<IconDeviceMobile size={24} className="text-purple-500" />}
                />
                <StatCard
                    title="Updates Clicked"
                    value={pieData.find(d => d.name === 'update_now')?.value || 0}
                    icon={<IconMouse size={24} className="text-green-500" />}
                />
                <StatCard
                    title="Deferred"
                    value={pieData.find(d => d.name === 'update_later')?.value || 0}
                    icon={<IconMouse size={24} className="text-yellow-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Action Distribution</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Velocity Chart */}
            <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Update Velocity (Daily Successful Updates)</h2>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.updateVelocity || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" stroke="#888" />
                            <YAxis stroke="#888" />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" name="Updates" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Fragmentation */}
                <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">User Fragmentation (Current Versions)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.versionFragmentation || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" stroke="#888" />
                                <YAxis stroke="#888" />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#8884d8" name="Devices" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Premium vs Free */}
                <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Premium vs Free Updates</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.premiumStats || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id.isPremium" tickFormatter={(val) => val ? 'Premium' : 'Free'} stroke="#888" />
                                <YAxis stroke="#888" />
                                <RechartsTooltip labelFormatter={(val) => val ? 'Premium' : 'Free'} />
                                <Bar dataKey="count" fill="#ffc658" name="Successful Updates" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity Log (Example)</h2>
                <div className="space-y-4">
                    <div className="space-y-4">
                        <p className="text-gray-500">Breakdown by Latest Version Target (Unique Users):</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="py-2">Target Version</th>
                                        <th className="py-2 text-center">Unique Popups</th>
                                        <th className="py-2 text-center">Clicks (Update Now)</th>
                                        <th className="py-2 text-center">Success (Updated)</th>
                                        <th className="py-2 text-center">Conversion</th>
                                        <th className="py-2 text-center">Update Later (Clicks)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdown.map((item) => {
                                        const popups = getStat(item.stats, 'popup_shown');
                                        const clicks = getStat(item.stats, 'update_now');
                                        const success = getStat(item.stats, 'app_updated_successfully');
                                        const deferred = getStat(item.stats, 'update_later');
                                        const conversion = popups > 0 ? Math.round((success / popups) * 100) : 0;

                                        return (
                                            <tr key={item.version} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-3 font-medium">{item.version}</td>
                                                <td className="py-3 text-center">{popups}</td>
                                                <td className="py-3 text-center text-blue-600 font-medium">{clicks}</td>
                                                <td className="py-3 text-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20 rounded">{success}</td>
                                                <td className="py-3 text-center text-gray-500">{conversion}%</td>
                                                <td className="py-3 text-center text-yellow-600">{deferred}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4 transition hover:shadow-lg hover:-translate-y-1">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
        </div>
    </div>
);

export default UpdateAnalytics;
