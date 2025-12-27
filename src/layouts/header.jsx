import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun,Menu, } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import axios from "axios"; // Import Axios for API request
import io from 'socket.io-client';
import ProfileImg from '../../src/assets/user-1.jpg';
import PropTypes from "prop-types";
import HederProfile from "../components/HederProfile";
import ThemeSelector from "../components/ThemeSelector";
import API_BASE_URL from "../components/Config";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const [notificationCount, setNotificationCount] = useState(0);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const fetchNotificationCount = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/admin-notifications/unread-count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data)
                setNotificationCount(response.data.count);
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        };

        fetchNotificationCount();

        // Socket connection for real-time updates
        const socket = io('https://api.morjodi.com'); // Adjust URL if needed

        socket.on('admin-notification-count-update', (data) => {
            setNotificationCount(data.count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleBellClick = () => {
        navigate('/admin-notifications');
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4  transition-colors dark:bg-slate-950">
            <div className="flex items-center gap-x-3">
                <button className="btn-ghost size-10 ml-2 " onClick={() => setCollapsed(!collapsed)}>
                    <Menu className={collapsed && "rotate-180"} />
                </button>
            </div>
            <div className="flex items-center gap-x-3">
            <button
  className={`btn-ghost size-10 ${theme === "dark" ? "" : ""}`}
  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
>
  <Sun size={20} className="dark:hidden" />
  <Moon size={20} className="hidden dark:block" />
</button>
<div className="relative">
    <button className="btn-ghost size-10" onClick={handleBellClick}>
        <Bell size={20} />
        {notificationCount > 0 && (
            <span className="absolute top-[-10] right-[10] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                {notificationCount}
            </span>
        )}
    </button>
</div>
       <div className="flex items-center gap-x-3">
                    <ThemeSelector/>
                </div>
                <div className="flex items-center gap-x-3">
                    <HederProfile/>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
