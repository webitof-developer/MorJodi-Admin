import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { Bell, Menu, Moon, Sun } from "lucide-react";

import API_BASE_URL from "../components/Config";
import HederProfile from "../components/HederProfile";
import { useTheme } from "@/hooks/use-theme";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const fetchNotificationCount = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/admin-notifications/unread-count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setNotificationCount(response.data.count);
            } catch (error) {
                console.error("Error fetching notification count:", error);
            }
        };

        fetchNotificationCount();

        const socket = io("https://api.morjodi.com");

        socket.on("admin-notification-count-update", (data) => {
            setNotificationCount(data.count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleBellClick = () => {
        navigate("/admin-notifications");
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white/90 px-4 shadow-sm backdrop-blur transition-colors dark:bg-slate-950/90">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost ml-2 size-10"
                    aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <Menu className={collapsed ? "rotate-180" : ""} />
                </button>
            </div>
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    aria-label="Toggle theme"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>
                <div className="relative">
                    <button
                        className="btn-ghost size-10"
                        aria-label="View notifications"
                        onClick={handleBellClick}
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold leading-none text-white shadow">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-x-3">
                    <HederProfile />
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
