import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import Page from "@/routes/dashboard/page";
import Login from "./routes/Pages/Login";
import EditProfile from "./routes/Pages/EditProfile";
import ForgotPassword from "./routes/Pages/ForgotPassword";
import VerifyOtp from "./routes/Pages/VerifyOtp";
import EditUser from "./routes/Pages/EditUser";
import EditReligion from "./routes/Pages/EditReligion";
import EditCaste from "./routes/Pages/EditCaste";
import EditSubCaste from "./routes/Pages/EditSubCaste";
import EditGotra from "./routes/Pages/EditGotra"; // New import
import EditLocation from "./routes/Pages/EditLocation";
import EditProfession from "./routes/Pages/EditProfession";
import EditMotherTongue from "./routes/Pages/EditMotherTongue";
import EditEducation from "./routes/Pages/EditEducation";
import EditAbout from "./routes/Pages/EditAbout";
import EditContact from "./routes/Pages/EditContact";
import EditTermsPrivacy from "./routes/Pages/EditTermsPrivacy";
import EditRaasi from "./routes/Pages/EditRaasi";

import ManageUsers from "./routes/Pages/ManageUsers";
import PremiumUsers from "./routes/Pages/PremiumUsers";
import ExpiredUsers from "./routes/Pages/ExpiredUsers";
import ManageReligion from "./routes/Pages/ManageReligion";
import AddReligion from "./routes/Pages/AddReligion";
import ManageCaste from "./routes/Pages/ManageCaste";
import AddCaste from "./routes/Pages/AddCaste";
import AddSubCaste from "./routes/Pages/AddSubCaste";
import AddGotra from "./routes/Pages/AddGotra"; // New import
import ManageSubCaste from "./routes/Pages/ManageSubCaste";
import ManageGotra from "./routes/Pages/ManageGotra"; // New import
import AddEducation from "./routes/Pages/AddEducation";
import ManageEducation from "./routes/Pages/ManageEducation";
import AddMotherTongue from "./routes/Pages/AddMotherTongue";
import ManageMotherTongue from "./routes/Pages/ManageMotherTongue";
import AddProfession from "./routes/Pages/AddProfession";
import ManageProfession from "./routes/Pages/ManageProfession";
import ManageLocation from "./routes/Pages/ManagerLocation";
import AddLocation from "./routes/Pages/AddLocation";
import ManageRaasi from "./routes/Pages/ManageRaasi";
import AddRaasi from "./routes/Pages/AddRaasi";
import CreateProfile from "./routes/Pages/CreateProfile";
import ManagePlans from "./routes/Pages/ManagePlans";
import AddPlan from "./routes/Pages/AddPlan";
import EditPlan from "./routes/Pages/EditPlan";
import ManageCoupons from "./routes/Pages/ManageCoupons";
import AddCoupon from "./routes/Pages/AddCoupon";
import EditCoupon from "./routes/Pages/EditCoupon";
import Home from "./routes/Pages/Home";
import AddBanner from "./routes/Pages/AddBanner";
import EditBanner from "./routes/Pages/EditBanner";
import ManageBanner from "./routes/Pages/ManageBanner";
import ManageAbout from "./routes/Pages/ManageAbout";
import AddAbout from "./routes/Pages/AddAbout";

import ManageContact from "./routes/Pages/ManageContact";
import AddContact from "./routes/Pages/AddContact";
import ManageFollow from "./routes/Pages/ManageFollow";
import AddFollow from "./routes/Pages/AddFollow";
import EditFollow from "./routes/Pages/EditFollow";

// Advertising Management
import ManageAdvertising from "./routes/Pages/ManageAdvertising";
import AddAdvertising from "./routes/Pages/AddAdvertising";
import EditAdvertising from "./routes/Pages/EditAdvertising";

// Terms & Privacy Management
import ManageTermsPrivacy from "./routes/Pages/ManageTermsPrivacy";
import AddTermsPrivacy from "./routes/Pages/AddTermsPrivacy";

// Complaint Management
import ManageComplaints from "./routes/Pages/ManageComplaints";
import EditComplaint from "./routes/Pages/EditComplaint";


import RefrealSetting from "./routes/Pages/RefrealSetting";
import AppShareLinkSetting from "./routes/Pages/AppShareLinkSetting";
import IdManagement from "./routes/Pages/IdManagement";



import DeletionRequests from "./routes/Pages/DeletionRequests";
import AdminNotifications from "./routes/Pages/AdminNotifications";
import DefaultUserSetting from "./routes/Pages/DefaultUserSetting";
import DeletionRequestDetails from "./routes/Pages/DeletionRequestDetails";
import ComplaintDetails from "./routes/Pages/ComplaintDetails";
import ThemeSettings from "./routes/Pages/ThemeSettings";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element:  <Login />,
        },
        {
            path: "/forgot-password",
            element:  <ForgotPassword />,
        },
        {
            path: "/verify-otp",
            element: <VerifyOtp />,
        },
   

   
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                   path:"/dashboard",
                    index: true,
                    element: <Page />,
                },
                {
                    path:"/editprofile/:id",
                    index: true,
                    element: <EditProfile />,
                }, 
                {
                    path:"/edit-user/:id",
                    index: true,
                    element: <EditUser />,
                }, 
                {
                    path:"/edit-religion/:id",
                    index: true,
                    element: <EditReligion />,
                }, 
                {
                    path:"/edit-caste/:id",
                    index: true,
                    element: <EditCaste />,
                }, 
                {
                    path:"/edit-subcaste/:id",
                    index: true,
                    element: <EditSubCaste />,
                }, 
                {
                    path:"/edit-location/:id",
                    index: true,
                    element: <EditLocation />,
                }, 
                {
                    path:"/edit-profession/:id",
                    index: true,
                    element: <EditProfession />,
                }, 
                {
                    path:"/edit-mothertongue/:id",
                    index: true,
                    element: <EditMotherTongue />,
                }, 
                {
                    path:"/edit-education/:id",
                    index: true,
                    element: <EditEducation />,
                }, 
                {
                    path:"/edit-about/:id",
                    index: true,
                    element: <EditAbout />,
                }, 
                {
                    path:"/edit-contact/:id",
                    index: true,
                    element: <EditContact />,
                }, 
                {
                    path:"/edit-termsprivacy/:id",
                    index: true,
                    element: <EditTermsPrivacy />,
                }, 
                {
                    path:"/edit-raasi/:id",
                    index: true,
                    element: <EditRaasi />,
                }, 
                
                {
                    path:"/users",
                    index: true,
                    element: <ManageUsers />,
                }, 
                {
                    path:"/theme-settings",
                    index: true,
                    element: <ThemeSettings />,
                },
                {
                    path:"/premium-users",
                    index: true,
                    element: <PremiumUsers />,
                },
                {
                    path:"/expired-users",
                    index: true,
                    element: <ExpiredUsers />,
                },
                    {
                    path:"/religion",
                    index: true,
                    element: <ManageReligion />,
                }, 
                     {
                    path:"/addreligion",
                    index: true,
                    element: <AddReligion />,
                }, 
                         {
                    path:"/caste",
                    index: true,
                    element: <ManageCaste />,
                }, 
                     {
                    path:"/addcaste",
                    index: true,
                    element: <AddCaste />,
                }, 
                             {
                    path:"/caste",
                    index: true,
                    element: <ManageCaste />,
                }, 
                     {
                    path:"/addsubcaste",
                    index: true,
                    element: <AddSubCaste />,
                }, 
                  {
                    path:"/subcaste",
                    index: true,
                    element: <ManageSubCaste />,
                }, 
                {
                    path:"/addgotra",
                    index: true,
                    element: <AddGotra />,
                }, 
                {
                    path:"/edit-gotra/:id",
                    index: true,
                    element: <EditGotra />,
                }, 
                {
                    path:"/gotra",
                    index: true,
                    element: <ManageGotra />,
                }, 
                        {
                    path:"/addeducation",
                    index: true,
                    element: <AddEducation />,
                }, 
                  {
                    path:"/education",
                    index: true,
                    element: <ManageEducation />,
                }, 
                           {
                    path:"/addmothertongue",
                    index: true,
                    element: <AddMotherTongue />,
                }, 
                  {
                    path:"/mothertongue",
                    index: true,
                    element: <ManageMotherTongue />,
                }, 
                           {
                    path:"/addprofession",
                    index: true,
                    element: <AddProfession />,
                }, 
                  {
                    path:"/profession",
                    index: true,
                    element: <ManageProfession />,
                }, 
                           {
                    path:"/addlocation",
                    index: true,
                    element: <AddLocation />,
                }, 
                  {
                    path:"/location",
                    index: true,
                    element: <ManageLocation/>,
                }, 
                                   {
                    path:"/addraasi",
                    index: true,
                    element: <AddRaasi />,
                }, 
                  {
                    path:"/raasi",
                    index: true,
                    element: <ManageRaasi/>,
                }, 
                      {
                    path:"/addprofile",
                    index: true,
                    element: <CreateProfile/>,
                }, 
                      {
                    path:"/plans",
                    index: true,
                    element: <ManagePlans />,
                }, 
                      {
                    path:"/coupons",
                    index: true,
                    element: <ManageCoupons />,
                }, 
                      {
                    path:"/addplan",
                    index: true,
                    element: <AddPlan />,
                },         {
                    path:"/editplan/:id",
                    index: true,
                    element: <EditPlan />,
                }, 
                      {
                    path:"/add-coupon",
                    index: true,
                    element: <AddCoupon />,
                }, 
                      {
                    path:"/edit-coupon/:id",
                    index: true,
                    element: <EditCoupon />,
                }, 
                 {
                    path: "/addbanner",
                    index: true,
                    element: <AddBanner />,
                },

                {
                    path: "/editbanner/:id",
                    index: true,
                    element: <EditBanner />,
                },
                {
                    path: "/managebanner",
                    index: true,
                    element: <ManageBanner />,
                },
                 {
                    path: "/terms-privacy",
                    index: true,
                    element: <ManageTermsPrivacy />,
                },
                {
                    path: "/addtermsprivacy",
                    index: true,
                    element: <AddTermsPrivacy />,
                },
                {
                    path: "/edittermsprivacy/:id",
                    index: true,
                    element: <EditTermsPrivacy />,
                },
                  {
                    path: "/about",
                    index: true,
                    element: <ManageAbout />,
                },
                {
                    path: "/addabout",
                    index: true,
                    element: <AddAbout />,
                },
                {
                    path: "/editabout/:id",
                    index: true,
                    element: <EditAbout />,
                },
                {
                    path: "/contact",
                    index: true,
                    element: <ManageContact />,
                },
                {
                    path: "/addcontact",
                    index: true,
                    element: <AddContact />,
                },
                {
                    path: "/editcontact/:id",
                    index: true,
                    element: <EditContact />,
                },
                {
                    path: "/follow",
                    index: true,
                    element: <ManageFollow />,
                },
                {
                    path: "/add-follow",
                    index: true,
                    element: <AddFollow />,
                },
                {
                    path: "/edit-follow/:id",
                    index: true,
                    element: <EditFollow />,
                },
                {
                    path: "/refrealSetting",
                    index: true,
                    element: <RefrealSetting />,
                },
                {
                    path: "/app-share-link-setting",
                    index: true,
                    element: <AppShareLinkSetting />,
                },
                {
                    path: "/id-management",
                    index: true,
                    element: <IdManagement />,
                },
                {
                    path: "/defaultusersetting",
                    index: true,
                    element: <DefaultUserSetting />,
                },
                // Advertising Routes
                {
                    path: "/manage-advertising",
                    index: true,
                    element: <ManageAdvertising />,
                },
                {
                    path: "/add-advertising",
                    index: true,
                    element: <AddAdvertising />,
                },
                {
                    path: "/edit-advertising/:id",
                    index: true,
                    element: <EditAdvertising />,
                },
                // Complaint Routes
                {
                    path: "/manage-complaints",
                    index: true,
                    element: <ManageComplaints />,
                },
                {
                    path: "/edit-complaint/:id",
                    index: true,
                    element: <EditComplaint />,
                },
                {
                    path: "/deletion-requests",
                    index: true,
                    element: <DeletionRequests />,
                },
                {
                    path: "/admin-notifications",
                    index: true,
                    element: <AdminNotifications />,
                },
                // {
                //     path: "/admin-notification-details/:id",
                //     index: true,
                //     element: <AdminNotificationDetails/>,
                // },
                {
                    path: "/complaint-details/:id",
                    index: true,
                    element: <ComplaintDetails/>,
                },
                {
                    path: "/deletion-request-details/:id",
                    index: true,
                    element: <DeletionRequestDetails/>,
                },

            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
