import { forwardRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { LiaAngleDownSolid, LiaAngleUpSolid } from "react-icons/lia";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { UserProfile } from "../components/UserProfile";
import API_BASE_URL from "../components/Config";
import { navbarLinks } from "../constants";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [openDropdown, setOpenDropdown] = useState({});

  // ✅ Safely get token and userId
  const token = localStorage.getItem("authToken");
 
  console.log(token)



 

  useEffect(() => {
  
    const fetchUserDetails = async () => {

      console.log(`${API_BASE_URL}/api/user/singleuser`)
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/singleuser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
console.log(res.data)
        const userRole = res.data.user?.role;
        setRole(userRole);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setRole(null);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserDetails();
  }, [token]);

  const links =
    role === "admin"
      ? navbarLinks.Admin
      : []
    
  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      ref={ref}
      className={cn(
        "fixed z-50 flex h-full flex-col bg-white shadow-xl dark:bg-gray-900 transition-all overflow-hidden  px-3",
        collapsed ? "w-[90px] items-center" : "w-[300px]",
        collapsed ? "max-md:-left-full" : "max-md:left-0"
      )}
    >
      {/* Logo */}
      <div className={cn("flex p-3", !collapsed && "ml-8 p-2 mb-3")}>
        {!collapsed && (
          <>
            <img
              className="w-40 h-15 mt-5 rounded-lg block dark:hidden"
              src="/03.png"
              alt="Light Logo"
            />
            <img
              className="w-40 h-15 mt-5 rounded-lg hidden dark:block"
              src="/07.png"
              alt="Dark Logo"
            />
          </>
        )}
      </div>
      <div className="overflow-y-auto sidebar-container h-full">

      {/* Navigation Links */}
     {loadingRole ? (
  <p className="text-center text-gray-500 dark:text-gray-400">Loading menu...</p>
) : links.length > 0 ? (
  links.map((link) =>
    link.subMenu ? (
      <div key={link.label} className="relative mb-1">
        {/* DROPDOWN TOGGLE */}
        <button
          className={cn(
            "group w-full relative flex items-center justify-between rounded-lg",
            "px-4 py-3 transition-colors duration-200",
            "text-gray-700 dark:text-gray-300",
            "hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:rounded-full",
            "before:h-0 before:w-1 before:bg-primary before:opacity-0 before:transition-all before:duration-200",
            openDropdown[link.label] && "before:h-6 before:opacity-100 bg-primary/10 text-primary"
          )}
          onClick={() => toggleDropdown(link.label)}
        >
          <div className="flex items-center gap-4">
            {link.icon && (
              <div
                className={cn(
                  "p-2 rounded-md transition-colors duration-200",
                  openDropdown[link.label]
                    ? "bg-primary/20 text-primary"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                  "group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                <link.icon size={collapsed ? 20 : 18} />
              </div>
            )}
            {!collapsed && <span className="truncate">{link.label}</span>}
          </div>

          {!collapsed && (
            <div className="shrink-0">
              {openDropdown[link.label] ? (
                <LiaAngleUpSolid size={14} className="transition-colors hover:text-primary" />
              ) : (
                <LiaAngleDownSolid size={14} className="transition-colors hover:text-primary" />
              )}
            </div>
          )}
        </button>

        {/* SUBMENU */}
        {!collapsed && openDropdown[link.label] && (
          <div className="mt-1 ps-6 space-y-1">
        {link.subMenu.map((subLink) => (
  <NavLink
    key={subLink.label}
    to={subLink.path}
    className={({ isActive }) =>
      cn(
        // layout
        "group relative flex items-center gap-3 rounded-lg ps-3 pe-2 py-2 transition-colors duration-200",

        // base text
        isActive ? "text-white" : "text-gray-600 dark:text-gray-300",

        // UNSELECTED hover: primary low opacity bg + primary text
        !isActive && "hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15",

        // SELECTED row bg: solid primary; hover darker primary
        isActive && "bg-primary hover:bg-primary-dark",

        // LEFT INDICATOR (single definition)
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:rounded-full before:transition-all before:duration-200",

        // unselected: indicator shows on hover in primary
        !isActive && "before:bg-primary before:w-[3px] before:h-0 before:opacity-0 group-hover:before:h-5 group-hover:before:opacity-100",

       
      )
    }
  >
    {({ isActive }) => (
      <>
        {subLink.icon && (
          <div
            className={cn(
              "p-2 rounded-md transition-colors duration-200",

              // UNSELECTED: neutral icon box; hover tint
              !isActive &&
                "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-primary/15 group-hover:text-primary",

              // SELECTED: white icon box, icon in theme color; on hover icon slightly darker
              isActive && "bg-white text-primary hover:text-primary-dark"
            )}
          >
            <subLink.icon size={18} />
          </div>
        )}
        <p className="truncate">{subLink.label}</p>
      </>
    )}
  </NavLink>
))}

          </div>
        )}
      </div>
    ) : (
    <NavLink
  key={link.label}
  to={link.path}
  className={({ isActive }) =>
    cn(
      "group relative flex items-center gap-3 rounded-lg mb-1 px-4 py-3 transition-colors duration-200",
      isActive
        ? "bg-primary hover:bg-primary-dark text-white" // full row bg
        : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15",
     
    )
  }
>
  {({ isActive }) => (
    <>
      {link.icon && (
        <div
          className={cn(
            "p-2 rounded-md transition-colors duration-200",
            isActive
              ? "bg-white text-primary"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-primary/20 group-hover:text-primary"
          )}
        >
          <link.icon size={20} />
        </div>
      )}
      {!collapsed && <p className="truncate">{link.label}</p>}
    </>
  )}
</NavLink>

    )
  )
) : (
  <p className="text-center text-gray-500 dark:text-gray-400">No menu items available.</p>
)}
      </div>



      {!collapsed && (
        <div className=" m-2">
          <UserProfile />
        </div>
      )}
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
};
