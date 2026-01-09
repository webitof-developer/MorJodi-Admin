import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconAdjustments,
  IconChartBar,
  IconChartPie,
  IconGauge,
  IconTrendingUp,
  IconUsersGroup,
  IconWaveSine,
} from "@tabler/icons-react";

import API_BASE_URL from "./Config";
import { useTheme } from "../hooks/use-theme";

const defaultPalette = {
  primary: "#B3252D",
  primaryLight: "#E57373",
  secondary: "#444444",
  secondaryDark: "#222222",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const AnalyticsDashboard = () => {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (d) => d.toISOString().split("T")[0];
  const today = useMemo(() => new Date(), []);
  const initialStart = useMemo(() => {
    const prior = new Date();
    prior.setDate(prior.getDate() - 365);
    return prior;
  }, []);

  const [start, setStart] = useState(formatDate(initialStart));
  const [end, setEnd] = useState(formatDate(today));
  const [palette, setPalette] = useState(defaultPalette);

  useEffect(() => {
    syncPalette();
    fetchAnalytics(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const syncPalette = () => {
    try {
      const style = getComputedStyle(document.documentElement);
      setPalette({
        primary: style.getPropertyValue("--primary-color").trim() || defaultPalette.primary,
        primaryLight: style.getPropertyValue("--primary-light").trim() || defaultPalette.primaryLight,
        secondary: style.getPropertyValue("--secondary-color").trim() || defaultPalette.secondary,
        secondaryDark: style.getPropertyValue("--secondary-dark").trim() || defaultPalette.secondaryDark,
      });
    } catch (err) {
      console.error("Palette sync failed", err);
      setPalette(defaultPalette);
    }
  };

  const fetchAnalytics = async (rangeStart = start, rangeEnd = end) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/api/analytics`, {
        params: { start: rangeStart || undefined, end: rangeEnd || undefined },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Analytics could not be loaded right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthlyUserData = useMemo(
    () =>
      analytics?.userGrowth?.monthly?.map((d) => ({
        month: `${monthNames[d._id?.month] || d._id?.month || ""} ${d._id?.year ?? ""}`.trim(),
        users: d.totalUsers,
        completed: d.completedProfiles,
      })) || [],
    [analytics],
  );

  const planRevenueData = useMemo(
    () =>
      analytics?.revenue?.subscriptionStats?.map((p) => ({
        name: p.plan?.name || "Plan",
        revenue: p.totalRevenue,
        count: p.count,
      })) || [],
    [analytics],
  );

  const featureUsageData = useMemo(
    () =>
      analytics?.featureUsage?.featureUsageStats?.map((f) => ({
        feature: f._id
          ?.replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        count: f.totalUsage,
      })) || [],
    [analytics],
  );

  const interestData =
    analytics?.matchmaking?.interests && [
      { name: "Accepted", value: analytics.matchmaking.interests.accepted || 0 },
      { name: "Pending", value: analytics.matchmaking.interests.sent || 0 },
      { name: "Declined", value: analytics.matchmaking.interests.declined || 0 },
    ];

  const viewToChat = analytics?.matchmaking?.viewToChat || { views: 0, chats: 0 };

  const totals = useMemo(() => {
    const newUsers = monthlyUserData.reduce((sum, d) => sum + (d.users || 0), 0);
    const completedProfiles = monthlyUserData.reduce((sum, d) => sum + (d.completed || 0), 0);
    const completionRate = newUsers ? Math.round((completedProfiles / newUsers) * 100) : 0;

    const revenue = planRevenueData.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const totalPlans = planRevenueData.reduce((sum, p) => sum + (p.count || 0), 0);

    const totalInterests = (interestData || []).reduce((sum, i) => sum + (i.value || 0), 0);
    const acceptanceRate = totalInterests
      ? Math.round(((interestData?.find((i) => i.name === "Accepted")?.value || 0) / totalInterests) * 100)
      : 0;
    const chatConversionRate = viewToChat.views ? Math.round((viewToChat.chats / viewToChat.views) * 100) : 0;

    return {
      newUsers,
      completedProfiles,
      completionRate,
      revenue,
      totalPlans,
      acceptanceRate,
      chatConversionRate,
    };
  }, [interestData, monthlyUserData, planRevenueData, viewToChat]);

  const formatNumber = (value) => (typeof value === "number" ? value.toLocaleString("en-IN") : "0");

  const quickRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    setStart(startStr);
    setEnd(endStr);
    fetchAnalytics(startStr, endStr);
  };

  const viewToChatBar = [
    { name: "Profile Views", value: viewToChat.views || 0 },
    { name: "Chats Started", value: viewToChat.chats || 0 },
  ];

  const emptyState = <p className="text-sm text-gray-500 dark:text-gray-400">Not enough data for this period.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Advanced analytics</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement & revenue insights</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => quickRange(days)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary/60"
              >
                Last {days}d
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            Start date
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm transition focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            End date
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-sm transition focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fetchAnalytics()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <IconAdjustments size={18} />
              Apply filters
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "New users",
            value: formatNumber(totals.newUsers),
            helper: "Users created in this range",
            icon: IconUsersGroup,
            accent: "bg-primary/10 text-primary",
          },
          {
            label: "Profile completion",
            value: `${totals.completionRate || 0}%`,
            helper: `${formatNumber(totals.completedProfiles)} completed`,
            icon: IconGauge,
            accent: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
          },
          {
            label: "Revenue generated",
            value: currencyFormatter.format(totals.revenue || 0),
            helper: `${formatNumber(analytics?.totalPremiumUsers ?? totals.totalPlans ?? 0)} active plans`,
            icon: IconChartBar,
            accent: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
          },
          {
            label: "Chat conversion",
            value: `${totals.chatConversionRate || 0}%`,
            helper: `${formatNumber(viewToChat.chats || 0)} chats from views`,
            icon: IconTrendingUp,
            accent: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-[1px] hover:shadow-md dark:border-gray-800 dark:bg-slate-900/70"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{loading ? "—" : card.value}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.helper}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.accent}`}>
                <Icon size={22} stroke={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Growth</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User growth & completion</h3>
              </div>
              <IconWaveSine className="text-primary" size={20} />
            </div>
            {monthlyUserData.length ? (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart data={monthlyUserData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={palette.primary}
                    strokeWidth={3}
                    dot={false}
                    name="New users"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={palette.secondary}
                    strokeWidth={3}
                    dot={false}
                    name="Completed profiles"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              emptyState
            )}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Plans</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue per plan</h3>
              </div>
              <IconChartBar className="text-primary" size={20} />
            </div>
            {planRevenueData.length ? (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart data={planRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip formatter={(value) => currencyFormatter.format(value || 0)} />
                  <Bar dataKey="revenue">
                    {planRevenueData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index % 2 === 0 ? palette.primary : palette.primaryLight}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              emptyState
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Engagement</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feature usage</h3>
              </div>
              <IconAdjustments className="text-primary" size={20} />
            </div>
            {featureUsageData.length ? (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={featureUsageData}
                  layout="vertical"
                  margin={{ left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                  />
                  <YAxis
                    dataKey="feature"
                    type="category"
                    stroke="#94a3b8"
                    width={140}
                  />
                  <Tooltip />
                  <Bar dataKey="count">
                    {featureUsageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? palette.primary : palette.secondary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              emptyState
            )}
          </div>
        </div>
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Interests</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Matchmaking status</h3>
              </div>
              <IconChartPie className="text-primary" size={20} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {interestData?.length ? (
                <ResponsiveContainer
                  width="100%"
                  height={260}
                >
                  <PieChart>
                    <Pie
                      data={interestData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label
                    >
                      {interestData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={idx % 2 === 0 ? palette.primary : palette.primaryLight}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                emptyState
              )}
              <div className="flex flex-col justify-center gap-2 rounded-xl border border-gray-100 bg-white/80 p-3 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-slate-900/80 dark:text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Acceptance rate</span>
                  <span className="text-lg font-semibold text-primary">{totals.acceptanceRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion to chat</span>
                  <span className="text-lg font-semibold text-primary">{totals.chatConversionRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total interests</span>
                  <span>{formatNumber((interestData || []).reduce((sum, i) => sum + (i.value || 0), 0))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Funnel</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">View → chat conversion</h3>
              </div>
              <IconGauge className="text-primary" size={20} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm dark:border-gray-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span>Profile views</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{formatNumber(viewToChat.views || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span>Chats started</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{formatNumber(viewToChat.chats || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span>Conversion</span>
                  <span className="text-base font-semibold text-primary">{totals.chatConversionRate || 0}%</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={viewToChatBar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value">
                      {viewToChatBar.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={index % 2 === 0 ? palette.primary : palette.secondary}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
