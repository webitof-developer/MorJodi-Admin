// admin-panel/src/constants/navbarLinks.js
import {
  IconDashboard,
  IconUser,
  IconUsers,
  IconSettings,
  IconScale,
  IconInfoCircle,
  IconFileDescription,
  IconPhoneCall,
  IconBook,
  IconBriefcase,
  IconLanguage,
  IconRosette,
  IconUsersGroup,
  IconUserCircle,
  IconPhoto,
  IconBuildingChurch,
  IconZodiacLeo,
  IconClockHour5,
  IconCrown,
  IconPalette,
  IconTag,
  IconDeviceMobile,
  IconChartBar,
  IconBell
} from "@tabler/icons-react";
import { FaGift } from "react-icons/fa";

export const navbarLinks = {
  Admin: [

  
    {
      label: "Dashboard",
      icon: IconDashboard,
      path: "/dashboard",
    },
    {
      label: "User Management",
      icon: IconUser,
      path: "/users",
    },
    {
      label: "Premium Users",
      icon: IconCrown,
      path: "/premium-users",
    },
    {
      label: "Expired Users",
      icon: IconClockHour5,
      path: "/expired-users",
    },
    {
      label: "Deletion Requests",
      icon: IconUser,
      path: "/deletion-requests",
    },
    {
      label: "Data Requests",
      icon: IconFileDescription, // Using a generic icon, can be updated
      path: "/data-requests",
    },
  {
      label: "Manage Notices",
      icon: IconInfoCircle,
      path: "/notices/list",
    },
    {
      label: "Masters",
      icon: IconBook,
      subMenu: [
        {
          label: "Religion",
          icon: IconRosette,
          path: "/religion",
        },
        {
          label: "Cast",
          icon: IconUsersGroup,
          path: "/caste",
        },
        {
          label: "Subcast",
          icon: IconUserCircle,
          path: "/subcaste",
        },
        {
          label: "Gotra",
          icon: IconZodiacLeo,
          path: "/gotra",
        },
        {
          label: "Education",
          icon: IconBook,
          path: "/education",
        },
        {
          label: "Profession",
          icon: IconBriefcase,
          path: "/profession",
        },
        {
          label: "Mother Tongue",
          icon: IconLanguage,
          path: "/mothertongue",
        },
        {
          label: "Raasi",
          icon: IconBuildingChurch,
          path: "/raasi",
        },
        {
          label: "Location",
          icon: IconZodiacLeo,
          path: "/location",
        },
      ],
    },
    {
      label: "App Updates",
      icon: IconDeviceMobile,
      path: "/app-updates",
      subMenu: [
        {
          label: "Version Management",
          icon: IconDeviceMobile,
          path: "/version-management",
        },
        {
          label: "Update Analytics",
          icon: IconChartBar,
          path: "/update-analytics",
        },
      ]
    },
    {
      label: "Settings",
      icon: IconSettings,
      path: "/settings",
      subMenu: [
        {
          label: "General Settings",
          icon: IconSettings,
          path: "/general-settings",
        },
        {
          label: "Theme Settings",
          icon: IconPalette,
          path: "/theme-settings",
        },
        {
          label: "Plans Management",
          icon: IconScale,
          path: "/plans",
        },
        {
          label: "Coupons",
          icon: IconTag,
          path: "/coupons",
        },
        {
          label: "Refreal Setting",
          icon: FaGift,
          path: "/refrealsetting",
        },
        {
          label: "Default User Settings",
          icon: IconUsers,
          path: "/defaultusersetting",
        },
        {
          label: "Manage Banners",
          icon: IconPhoto,
          path: "/managebanner",
        },
        {
          label: "Manage Advertising",
          icon: IconPhoto,
          path: "/manage-advertising",
        },
        {
          label: "About MorJodi",
          icon: IconInfoCircle,
          path: "/about",
        },
        {
          label: "Terms & Privacy",
          icon: IconFileDescription,
          path: "/terms-privacy",
        },
        {
          label: "Contact Info",
          icon: IconPhoneCall,
          path: "/contact",
        },
        {
          label: "Follow Us",
          icon: IconUsers,
          path: "/follow",
        },
        {
          label: "Manage Complaints",
          icon: IconFileDescription,
          path: "/manage-complaints",
        },
        {
          label: "App Share Link Setting",
          icon: IconSettings,
          path: "/app-share-link-setting",
        },
        {
          label: "ID Management",
          icon: IconSettings,
          path: "/id-management",
        },
      ],
    },
  ],
};
