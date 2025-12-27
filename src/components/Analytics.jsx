import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import API_BASE_URL from "./Config";
import { useTheme } from "../hooks/use-theme";

const AnalyticsDashboard = () => {
    const { theme } = useTheme(); // <-- NOW USING THEME PROVIDER
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    // calculate default last 30 days
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 30);

    const formatDate = (d) => d.toISOString().split("T")[0];

    const [start, setStart] = useState(formatDate(priorDate));
    const [end, setEnd] = useState(formatDate(today));

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim();

    const primaryLight = getComputedStyle(document.documentElement).getPropertyValue("--primary-light").trim();

    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--secondary-color").trim();

    const secondaryDark = getComputedStyle(document.documentElement).getPropertyValue("--secondary-dark").trim();

    const pieColors = [primaryColor, secondaryColor, secondaryDark];

    useEffect(() => {
        fetchAnalytics();
    }, [theme]); // refetch when theme changes (optional but smart)

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE_URL}/api/analytics`, {
                params: { start: start || undefined, end: end || undefined },
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            console.log(res.data);
            setAnalytics(res.data.analytics);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center text-lg text-gray-600 dark:text-gray-300">Loading analytics...</p>;

    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthlyUserData = analytics?.userGrowth?.monthly?.map((d) => ({
        month: monthNames[d._id],
        users: d.totalUsers,
        completed: d.completedProfiles,
    })) || [];

    const planRevenueData = analytics?.revenue?.subscriptionStats?.map((p) => ({
        name: p.plan?.name,
        revenue: p.totalRevenue,
    })) || [];

    const formatFeature = (name) =>
        name
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const featureUsageData = analytics?.featureUsage?.featureUsageStats?.map((f) => ({
        feature: formatFeature(f._id),
        count: f.totalUsage,
    })) || [];

    const interestData = analytics?.matchmaking?.interests ? [
        { name: "Accepted", value: analytics.matchmaking.interests.accepted || 0 },
        { name: "Pending", value: analytics.matchmaking.interests.sent || 0 },
        { name: "Declined", value: analytics.matchmaking.interests.declined || 0 },
    ] : [];

    return (
        <div className="space-y-10 p-4">
            {/* FILTER HEADER */}
            <div className="mb-6 flex items-center space-x-4">
                <div>
                    <label className="text-sm text-gray-600  dark:text-gray-300">Start Date: </label>
                    <input
                        type="date"
                        className="rounded-xl bg-gray-100 p-2 dark:bg-gray-800 dark:text-white"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">End Date: </label>
                    <input
                        type="date"
                        className="rounded-xl bg-gray-100 p-2 dark:bg-gray-800 dark:text-white"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </div>

                <button
                    onClick={fetchAnalytics}
                    className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-white hover:opacity-90"
                >
                    Apply Filter
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2  "> 

                <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <h2 className="mb-4 text-xl font-bold dark:text-white">User Growth & Profile Completion</h2>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <LineChart data={monthlyUserData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#666"
                            />
                            <XAxis
                                dataKey="month"
                                stroke="#aaa"
                            />
                            <YAxis stroke="#aaa" />
                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke={primaryColor}
                                strokeWidth={3}
                            />

                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke={secondaryColor}
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

             
                <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
                    <h2 className="mb-4 text-xl font-bold dark:text-white">Revenue Per Plan</h2>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <BarChart data={planRevenueData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#666"
                            />
                            <XAxis
                                dataKey="name"
                                stroke="#aaa"
                            />
                            <YAxis stroke="#aaa" />
                            <Tooltip />

                            <Bar dataKey="revenue">
                                {planRevenueData.map((entry, index) => {
                                  
                                    return (
                                        <Cell
                                            key={index}
                                            fill={primaryColor}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

                   
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2  "> 
                <div className="rounded-2xl bg-white p-6  shadow-lg dark:bg-gray-900">
                    <h2 className="mb-4 text-xl font-bold dark:text-white">Feature Usage</h2>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <BarChart
                            data={featureUsageData}
                            layout="vertical"
                            margin={{ left: 40 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#666"
                            />
                            <XAxis
                                type="number"
                                stroke="#aaa"
                            />
                            <YAxis
                                dataKey="feature"
                                type="category"
                                stroke="#aaa"
                                width={120}
                            />
                            <Tooltip />
                            <Bar dataKey="count">
                                {featureUsageData.map((entry, index) => {
                                    const color = index % 2 === 0 ? primaryColor : secondaryColor;
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={color}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ===================================
          4. MATCHMAKING PIE
      ===================================== */}
                <div className="rounded-2xl bg-white p-6  shadow-lg dark:bg-gray-900">
                    <h2 className="mb-4 text-xl font-bold dark:text-white">Matchmaking Conversion</h2>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <PieChart>
                                <Pie
                                    data={interestData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label
                                >
                                    {interestData.map((entry, idx) => {
                                        const color = idx % 2 === 0 ? primaryColor : secondaryColor;
                                        return (
                                            <Cell
                                                key={idx}
                                                fill={color}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex flex-col justify-center dark:text-gray-300">
                            <p className="text-lg">
                                <b style={{ color: primaryColor }}>Views:</b> {analytics?.matchmaking?.viewToChat?.views || 0}
                            </p>
                            <p className="text-lg">
                                <b style={{ color: secondaryColor }}>Chats:</b> {analytics?.matchmaking?.viewToChat?.chats || 0}
                            </p>
                            <p className="mt-4 text-lg">
                                <b style={{ color: primaryColor }}>Conversion:</b>{" "}
                                {analytics?.matchmaking?.viewToChat?.views ? ((analytics.matchmaking.viewToChat.chats / analytics.matchmaking.viewToChat.views) * 100).toFixed(2) : 0}%
                            </p>
                    </div>
                </div>
            </div>
            </div>
    
        </div>
    );
};

export default AnalyticsDashboard;
