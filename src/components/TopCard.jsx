import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IconAlertTriangle,
  IconCrown,
  IconExternalLink,
  IconRefresh,
  IconSpeakerphone,
  IconTrashX,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "./Config";

const metricConfig = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: IconUsersGroup,
    endpoint: "/api/user/count",
    valuePath: "totalUsers",
    accent: "from-primary/15 via-white to-primary/5",
    to: "/users",
  },
  {
    key: "totalPremiumUsers",
    label: "Premium Users",
    icon: IconCrown,
    endpoint: "/api/user/premium/count",
    valuePath: "premiumUserCount",
    accent: "from-amber-200/60 via-white to-amber-100",
    to: "/users",
  },
  {
    key: "totalComplaints",
    label: "Total Complaints",
    icon: IconAlertTriangle,
    endpoint: "/api/complaints/count",
    valuePath: "totalComplaints",
    accent: "from-red-200/60 via-white to-rose-100",
    to: "/manage-complaints",
  },
  {
    key: "totalDeletionRequests",
    label: "Deletion Requests",
    icon: IconTrashX,
    endpoint: "/api/user/deletion-requests/count",
    valuePath: "totalDeletionRequests",
    accent: "from-sky-200/60 via-white to-sky-100",
    to: "/deletion-requests",
  },
  {
    key: "totalActiveAdvertising",
    label: "Active Advertising",
    icon: IconSpeakerphone,
    endpoint: "/api/advertising/active/count",
    valuePath: "totalActiveAdvertising",
    accent: "from-emerald-200/70 via-white to-emerald-100",
    to: "/manage-advertising",
  },
];

const TopCard = () => {
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPremiumUsers: 0,
    totalComplaints: 0,
    totalDeletionRequests: 0,
    totalActiveAdvertising: 0,
  });

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toLocaleString("en-IN") : "0";
  };

  const loadMetrics = async () => {
    setLoading(true);
    setError("");

    try {
      const responses = await Promise.all(
        metricConfig.map((metric) =>
          axios.get(`${API_BASE_URL}${metric.endpoint}`, { headers }),
        ),
      );

      const nextMetrics = responses.reduce((acc, res, index) => {
        const metric = metricConfig[index];
        const rawValue = res?.data?.[metric.valuePath];
        const value = Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;
        return { ...acc, [metric.key]: value };
      }, {});

      setMetrics(nextMetrics);
    } catch (err) {
      console.error("Dashboard metric fetch error:", err);
      setError("Unable to load metrics. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-gray-100 backdrop-blur dark:bg-slate-900/70 dark:ring-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Realtime overview
          </p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Operations pulse
          </h2>
        </div>
        <button
          type="button"
          onClick={loadMetrics}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-[1px] hover:border-primary/40 hover:text-primary hover:shadow-md dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-primary/60"
          aria-label="Refresh dashboard metrics"
        >
          <IconRefresh size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {metricConfig.map((card) => {
          const Icon = card.icon;
          return (
            <button
              type="button"
              key={card.key}
              onClick={() => handleNavigate(card.to)}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-left shadow transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-800 dark:bg-slate-900"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`}
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 text-primary shadow-sm ring-1 ring-gray-100 transition duration-200 group-hover:scale-[1.03] dark:bg-slate-900/80 dark:ring-gray-800">
                  <Icon stroke={1.5} size={24} />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition group-hover:bg-primary/10 group-hover:text-primary dark:bg-gray-800 dark:text-gray-300">
                  Live <IconExternalLink size={14} />
                </span>
              </div>
              <div className="relative mt-5 space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  ) : (
                    formatNumber(metrics[card.key])
                  )}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopCard;
