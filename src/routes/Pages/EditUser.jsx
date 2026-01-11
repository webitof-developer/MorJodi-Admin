import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { getImageUrl } from "../../utils/imageUtils";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCamera, FaTimesCircle, FaLock, FaGlobe, FaUserCheck, FaPlus
} from 'react-icons/fa';
import ModernMultiSelect from "../../components/ModernMultiSelect";
import FloatingInput from "../../components/FloatingInput";
import FloatingSelect from "../../components/FloatingSelect";
import FloatingDate from "../../components/FloatingDate";
import {
  Camera, Crown, PauseCircle, Calendar, Ban, ArrowUpRight, ArrowDownRight, CalendarPlus, X, Copy, Eye, Upload
} from "lucide-react";

const launchImageLibrary = async (options) => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = options.selectionLimit === 0;
    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      const assets = files.map(file => ({
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        file: file,
      }));
      resolve({ assets });
    };
    input.click();
  });
};

const USER_API_URL = `${API_BASE_URL}/api/user`;
const META_API_BASE_URL = `${API_BASE_URL}/api/meta`;

// --- Options Constants (Same as before) ---
const FATHER_STATUS_OPTIONS = [
  { value: 'Employed', name: 'Employed' }, { value: 'Business', name: 'Business' },
  { value: 'Retired', name: 'Retired' }, { value: 'Passed Away', name: 'Passed Away' },
  { value: 'Government Service', name: 'Government Service' }, { value: 'Private Job', name: 'Private Job' },
  { value: 'Farmer', name: 'Farmer' }, { value: 'Self Employed', name: 'Self Employed' },
  { value: 'Other', name: 'Other' },
];
const MOTHER_STATUS_OPTIONS = [
  { value: 'Homemaker', name: 'Homemaker' }, { value: 'Employed', name: 'Employed' },
  { value: 'Business', name: 'Business' }, { value: 'Retired', name: 'Retired' },
  { value: 'Passed Away', name: 'Passed Away' }, { value: 'Government Service', name: 'Government Service' },
  { value: 'Private Job', name: 'Private Job' }, { value: 'Self Employed', name: 'Self Employed' },
  { value: 'Other', name: 'Other' },
];
const FAMILY_VALUES_OPTIONS = [
  { value: 'Traditional', name: 'Traditional' }, { value: 'Moderate', name: 'Moderate' },
  { value: 'Liberal', name: 'Liberal' }, { value: 'Orthodox', name: 'Orthodox' },
  { value: 'Other', name: 'Other' },
];

const formatEducationData = (data) => (data || []).map(item => ({
  label: `${item.degree || ''} ${item.field ? `(${item.field})` : ''}`,
  value: item._id,
}));
const formatSimpleData = (data) => (data || []).map(item => ({
  label: item.name,
  value: item._id,
  name: item.name
}));
const formatLocationData = (data) => (data || []).map(item => ({
  label: `${item.city}, ${item.state}`,
  value: item._id,
  name: `${item.city}, ${item.state}`
}));
const formatProfessionData = (data) => (data || []).map(item => ({
  label: `${item.occupation}, ${item.industry}`,
  value: item._id,
  name: `${item.occupation}, ${item.industry}`
}));

const getInitialMultiSelectValue = (field, user, isUserEducation = false) => {
  const data = isUserEducation ? user.education : user?.partnerPreference?.[field];
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => item._id || item);
};

// --- Sub-components for specific UI elements ---

const SectionCard = ({ title, subTitle, children, className = "" }) => (
  <div className={`bg-white shadow-sm rounded-2xl shadow-sm p-6 mb-6 ${className}`}>
    {(title || subTitle) && (
      <div className="mb-4">
        {title && <h3 className="text-base font-bold text-gray-900 flex items-center gap-1">{title}</h3>}
        {subTitle && <p className="text-xs text-gray-400 mt-1">{subTitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const PhotoPlaceholder = ({ label, image, onUpload, onRemove, onView }) => (
  <div
    className="flex flex-col items-center justify-center bg-gray-100/80 rounded-xl h-24 w-full relative group cursor-pointer hover:bg-gray-200 transition"
    onClick={image ? onView : onUpload}
  >
    {image ? (
      <>
        <img src={image} className="h-full w-full object-cover rounded-xl" alt={label} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
        >
          <FaTimesCircle size={14} />
        </button>
      </>
    ) : (
      <>
        <Camera className="text-gray-400 mb-1.5" strokeWidth={1.5} size={24} />
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </>
    )}
  </div>
);

const ToggleButton = ({ label, isActive, onToggle, activeIcon: Icon, activeColor = "bg-primary" }) => (
  <div className="mb-3">
    <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-gray-100 rounded-lg p-1.5 gap-2">
      <div className="text-xs font-semibold text-gray-600 px-2">{label}</div>
      <div className="flex bg-white rounded-md shadow-sm p-0.5 w-full xl:w-auto">
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`flex-1 xl:flex-none justify-center items-center gap-1.5 px-3 py-1.5 rounded text-[11px] uppercase tracking-wide font-bold transition flex ${isActive ? `${activeColor} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}
        >
          {Icon && <Icon size={12} />} Public
        </button>
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`flex-1 xl:flex-none justify-center items-center gap-1.5 px-3 py-1.5 rounded text-[11px] uppercase tracking-wide font-bold transition flex ${!isActive ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <FaLock size={12} /> Private
        </button>
      </div>
    </div>
  </div>
);


const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [allMetaData, setAllMetaData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Subscription / Manage State
  const [plans, setPlans] = useState([]);
  const [fullUser, setFullUser] = useState(null);
  const [subscriptionDrawerOpen, setSubscriptionDrawerOpen] = useState(false);
  const [activeSubscriptionUser, setActiveSubscriptionUser] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    action: "assign", planId: "", extendDays: "30", pauseDays: "7",
    cancelMode: "immediate", customDays: "", note: "",
  });
  const [portalReady, setPortalReady] = useState(false);

  // --- STATE (Consolidated) ---
  const [formData, setFormData] = useState({
    // Basic
    fullName: '', email: '', phoneNumber: '', aboutMe: '',
    profileFor: 'Self', gender: 'Male', dateOfBirth: new Date(), height: 160,
    maritalStatus: 'Never Married', children: 'No Children', manglik: "Doesn't Matter", gotra: '',
    // Background
    religion: '', caste: '', subCaste: '', motherTongue: '', raasi: '',
    profession: '', annualIncome: '', location: '', education: [],
    // Family
    fatherStatus: '', motherStatus: '', brothers: '0', sisters: '0',
    familyType: 'Nuclear', familyValues: 'Traditional', familyLocation: '',
    // Lifestyle
    diet: 'Vegetarian', smoking: 'No', drinking: 'No',
    // Preferences 
    prefMaritalStatus: 'Never Married',
    prefAgeMin: '18', prefAgeMax: '40',
    prefHeightMin: 160, prefHeightMax: 180,
    prefManglik: "Doesn't Matter", prefAnnualIncome: '',
    prefReligions: [], prefCastes: [], prefSubCastes: [], prefGotras: [],
    prefMotherTongues: [], prefRaasis: [], prefLocations: [],
    prefEducations: [], prefProfessions: [],
  });

  // Images
  // Unified Gallery (Main + Photos)
  // Unified Gallery (Main + Photos)
  // Initialize with 6 empty slots
  const [galleryItems, setGalleryItems] = useState(Array(6).fill(null));
  const [displayId, setDisplayId] = useState('');
  const [aadharImage, setAadharImage] = useState(null);
  const [aadharImageFile, setAadharImageFile] = useState(null);
  const [panCardImage, setPanCardImage] = useState(null);
  const [panCardImageFile, setPanCardImageFile] = useState(null);

  // Back Images for Aadhar/PAN
  const [aadharBackImage, setAadharBackImage] = useState(null);
  const [aadharBackImageFile, setAadharBackImageFile] = useState(null);
  const [panCardBackImage, setPanCardBackImage] = useState(null);
  const [panCardBackImageFile, setPanCardBackImageFile] = useState(null);

  // --- FILTERING LOGIC ---
  const filteredCastes = useMemo(() => {
    if (!formData.religion) return [];
    return allMetaData?.castes?.filter(c => c.religion === formData.religion || c.religion?._id === formData.religion) || [];
  }, [allMetaData, formData.religion]);

  const filteredSubCastes = useMemo(() => {
    if (!formData.caste) return [];
    return allMetaData?.subCastes?.filter(c => c.caste === formData.caste || c.caste?._id === formData.caste) || [];
  }, [allMetaData, formData.caste]);

  // Register Logic Sync: Reset logic and dependent fields
  useEffect(() => {
    if (formData.maritalStatus === 'Never Married') {
      if (formData.children !== 'No Children') {
        setFormData(prev => ({ ...prev, children: 'No Children' }));
      }
    }
  }, [formData.maritalStatus]);

  // Reset Caste/SubCaste when Religion changes (handled via filtered lists, but resetting value prevents invalid state)
  useEffect(() => {
    // Optional: Clear caste if it doesn't belong to selected religion
    // This might be aggressive for edit mode if data loads async. 
    // For now, rely on filtered lists to hide invalid options.
  }, [formData.religion]);

  const [privacy, setPrivacy] = useState({ profile: true, photo: true, contact: true });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, metaRes, subRes] = await Promise.all([
          axios.get(`${USER_API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${META_API_BASE_URL}/profile-meta`),
          axios.get(`${API_BASE_URL}/api/admin-subscriptions/${id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { subscription: null } }))
        ]);

        const user = userRes.data.user;
        // Merge subscription details into user object for display simplification or keep separate
        // For now, let's attach it to user.subscription so existing UI logic works
        if (subRes.data.subscription) {
          user.subscription = subRes.data.subscription;
        }

        setFullUser(user);
        setAllMetaData(metaRes.data);
        setDisplayId(user?.profileId || user?.profileCode || user?._id || 'N/A');

        // Unified Gallery Load - Fixed 6 slots
        const newGallery = Array(6).fill(null);

        // Slot 0: Main Image
        if (user?.image) {
          newGallery[0] = { path: user.image, preview: getImageUrl(user.image), isDb: true };
        }

        // Slots 1-5: Photos array
        if (user?.photos && Array.isArray(user.photos)) {
          // Filter out the main image if it exists in photos array to avoid duplication
          const otherPhotos = user.photos.filter(p => p !== user.image);
          otherPhotos.forEach((p, i) => {
            if (i + 1 < 6 && p) { // Only add if path exists
              newGallery[i + 1] = { path: p, preview: getImageUrl(p), isDb: true };
            }
          });
        }
        setGalleryItems(newGallery);

        // ... (rest of loading logic: aadhar, pan, formData) ...
        setAadharImage(getImageUrl(user?.aadharFront));
        setAadharBackImage(getImageUrl(user?.aadharBack));

        setPanCardImage(getImageUrl(user?.panFront));
        setPanCardBackImage(getImageUrl(user?.panBack));

        setFormData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phoneNumber: user?.phoneNumber || '',
          aboutMe: user?.aboutMe || '',
          profileFor: user?.profileFor || 'Self',
          gender: user?.gender || 'Male',
          dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
          height: user?.height || 160,
          maritalStatus: user?.maritalStatus || 'Never Married',
          children: user?.children || 'No Children',
          manglik: user?.manglik || "Doesn't Matter",
          gotra: user?.gotra?._id || user?.gotra || '', // Ensure valid ID string

          religion: user?.religion?._id || user?.religion || '',
          caste: user?.caste?._id || user?.caste || '',
          subCaste: user?.subCaste?._id || user?.subCaste || '',
          motherTongue: user?.motherTongue?._id || user?.motherTongue || '',
          raasi: user?.raasi?._id || user?.raasi || '',
          profession: user?.profession?._id || user?.profession || '',
          location: user?.location?._id || user?.location || '',
          education: getInitialMultiSelectValue('education', user, true),
          annualIncome: user?.annualIncome || '',

          fatherStatus: user?.familyDetails?.fatherStatus || '',
          motherStatus: user?.familyDetails?.motherStatus || '',
          brothers: String(user?.familyDetails?.brothers || '0'),
          sisters: String(user?.familyDetails?.sisters || '0'),
          familyType: user?.familyDetails?.familyType || 'Nuclear',
          familyValues: user?.familyDetails?.familyValues || '',
          familyLocation: user?.familyDetails?.familyLocation?._id || user?.familyDetails?.familyLocation || '',

          diet: user?.lifestyle?.diet || 'Vegetarian',
          smoking: user?.lifestyle?.smoking || 'No',
          drinking: user?.lifestyle?.drinking || 'No',

          prefMaritalStatus: Array.isArray(user?.partnerPreference?.maritalStatus) ? user.partnerPreference.maritalStatus[0] : user?.partnerPreference?.maritalStatus || 'Never Married',
          prefAgeMin: String(user?.partnerPreference?.ageRange?.[0] || '18'),
          prefAgeMax: String(user?.partnerPreference?.ageRange?.[1] || '40'),
          prefHeightMin: user?.partnerPreference?.heightRange?.[0] || 160,
          prefHeightMax: user?.partnerPreference?.heightRange?.[1] || 180,
          prefManglik: Array.isArray(user?.partnerPreference?.manglik) ? user.partnerPreference.manglik[0] : user?.partnerPreference?.manglik || "Doesn't Matter",
          prefAnnualIncome: user?.partnerPreference?.annualIncome || '',

          prefReligions: getInitialMultiSelectValue('religion', user),
          prefCastes: getInitialMultiSelectValue('caste', user),
          prefSubCastes: getInitialMultiSelectValue('subCaste', user),
          prefGotras: getInitialMultiSelectValue('gotra', user),
          prefRaasis: getInitialMultiSelectValue('raasi', user),
          prefMotherTongues: getInitialMultiSelectValue('motherTongue', user),
          prefEducations: getInitialMultiSelectValue('education', user),
          prefProfessions: getInitialMultiSelectValue('profession', user),
          prefLocations: getInitialMultiSelectValue('location', user),
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // --- Subscription Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getPlanLabel = (user) => {
    if (!user?.isPremium) return "Free Plan";
    const planName = plans.find(p => p._id === user.planId)?.name;
    return planName || "Premium";
  };

  const getSubscriptionStatus = (user) => {
    if (!user) return { label: 'Unknown', tone: 'bg-gray-100 text-gray-700' };
    if (user.isBlocked) return { label: 'Blocked', tone: 'bg-red-100 text-red-700' };

    const isPaused = user.subscription?.pausedUntil && new Date(user.subscription.pausedUntil) > new Date();
    if (isPaused) return { label: 'Paused', tone: 'bg-yellow-100 text-yellow-700' };

    if (user.isPremium) return { label: 'Active', tone: 'bg-green-100 text-green-700' };
    return { label: 'Free', tone: 'bg-gray-100 text-gray-600' };
  };

  // --- Subscription Logic ---
  const openSubscriptionDrawer = async (user) => {
    setActiveSubscriptionUser(user);
    setSubscriptionForm({
      action: "assign", planId: "", extendDays: "30", pauseDays: "7",
      cancelMode: "immediate", customDays: "", note: "",
    });
    setSubscriptionDrawerOpen(true);
    setPortalReady(true);

    if (plans.length === 0) {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/plans`, { headers: { Authorization: `Bearer ${token}` } });
        // Depending on API response structure, adjust if needed. Typically it's res.data for array.
        setPlans(Array.isArray(res.data) ? res.data : (res.data.plans || []));
      } catch (err) {
        console.error("Failed to fetch plans", err);
      }
    }
  };

  const closeSubscriptionDrawer = () => {
    setSubscriptionDrawerOpen(false);
    setActiveSubscriptionUser(null);
  };

  const applySubscriptionAction = async () => {
    if (!activeSubscriptionUser) return;
    try {
      const payload = {
        action: subscriptionForm.action,
        planId: subscriptionForm.planId,
        days: subscriptionForm.action === 'extend' ? (subscriptionForm.extendDays === 'custom' ? parseInt(subscriptionForm.customDays) : parseInt(subscriptionForm.extendDays)) :
          subscriptionForm.action === 'pause' ? (subscriptionForm.pauseDays === 'custom' ? parseInt(subscriptionForm.customDays) : parseInt(subscriptionForm.pauseDays)) : undefined,
        cancelMode: subscriptionForm.cancelMode,
        note: subscriptionForm.note
      };

      await axios.post(`${API_BASE_URL}/api/admin-subscriptions/${activeSubscriptionUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", "Subscription updated", "success");
      closeSubscriptionDrawer();

      // Refresh User Data to reflect changes
      const userRes = await axios.get(`${USER_API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setFullUser(userRes.data.user);
    } catch (err) {
      console.error('Subscription Update Error:', err);
      Swal.fire("Error", err.response?.data?.message || "Failed to update subscription", "error");
    }
  };

  const pickImage = async (setImageUri, setImageFile, isGallery = false) => {
    try {
      if (isGallery) {
        // Count empty slots
        const emptyIndices = galleryItems.map((item, i) => item === null ? i : -1).filter(i => i !== -1);
        const availableSlots = emptyIndices.length;

        if (availableSlots <= 0) {
          Swal.fire("Limit Reached", "Max 6 photos allowed. Remove some to add new ones.", "info");
          return;
        }

        const result = await launchImageLibrary({ selectionLimit: availableSlots });
        if (result.assets && result.assets.length > 0) {
          setGalleryItems(prev => {
            const nextGallery = [...prev];
            let assetIndex = 0;

            // Fill available slots with selected assets
            for (let i = 0; i < nextGallery.length && assetIndex < result.assets.length; i++) {
              if (nextGallery[i] === null) {
                const asset = result.assets[assetIndex];
                nextGallery[i] = { file: asset.file, preview: asset.uri, isDb: false };
                assetIndex++;
              }
            }
            return nextGallery;
          });
        }
      } else {
        // Single Doc Image
        if (setImageUri && setImageFile) {
          const result = await launchImageLibrary({ selectionLimit: 1 });
          if (result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            setImageFile(result.assets[0].file);
          }
        }
      }
    } catch (err) {
      console.error('Error picking image: ', err);
    }
  };

  const pickHeaderImage = async () => {
    const result = await launchImageLibrary({ selectionLimit: 1 });
    if (result.assets && result.assets.length > 0) {
      const newItem = { file: result.assets[0].file, preview: result.assets[0].uri, isDb: false };
      setGalleryItems(prev => {
        const copy = [...prev];
        copy[0] = newItem; // Always replace main profile (slot 0)
        return copy;
      });
    }
  };

  const handleRemoveGalleryPhoto = (index) => {
    // Set specific slot to null instead of splicing
    setGalleryItems(prev => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (!['education', 'prefReligions', 'prefCastes', 'prefSubCastes', 'prefGotras', 'prefRaasis', 'prefMotherTongues', 'prefEducations', 'prefProfessions', 'prefLocations'].includes(key)) {
          if (key === 'dateOfBirth') fd.append(key, formData[key].toISOString().split('T')[0]);
          else if (key === 'height') fd.append(key, String(formData[key]));
          else if (formData[key] !== null && formData[key] !== undefined) fd.append(key, formData[key]);
        }
      });
      fd.append('education', JSON.stringify(formData.education));
      fd.append('familyDetails', JSON.stringify({
        fatherStatus: formData.fatherStatus,
        motherStatus: formData.motherStatus,
        brothers: formData.brothers,
        sisters: formData.sisters,
        familyType: formData.familyType,
        familyValues: formData.familyValues,
        familyLocation: formData.familyLocation
      }));
      fd.append('lifestyle', JSON.stringify({
        diet: formData.diet, smoking: formData.smoking, drinking: formData.drinking
      }));
      fd.append('partnerPreference', JSON.stringify({
        maritalStatus: formData.prefMaritalStatus,
        ageRange: [parseInt(formData.prefAgeMin), parseInt(formData.prefAgeMax)],
        heightRange: [formData.prefHeightMin, formData.prefHeightMax],
        religion: formData.prefReligions,
        caste: formData.prefCastes,
        subCaste: formData.prefSubCastes,
        gotra: formData.prefGotras,
        raasi: formData.prefRaasis,
        motherTongue: formData.prefMotherTongues,
        education: formData.prefEducations,
        profession: formData.prefProfessions,
        location: formData.prefLocations,
        manglik: formData.prefManglik,
        annualIncome: formData.prefAnnualIncome
      }));

      // --- IMAGES ---
      // 1. New Logic: Preserve Gaps for "existing" photos
      // WE rely on the backend concatenating [...existing, ...new].
      // We cannot preserve mixed order of new/old without backend changes.
      // BUT we can preserve gaps between old photos by sending "" placeholders.

      const mainItem = galleryItems[0];
      if (mainItem) {
        if (mainItem.file) {
          fd.append('image', mainItem.file);
        } else if (mainItem.path) {
          fd.append('mainImage', mainItem.path);
        }
      } else {
        // Explicitly clear main image if needed, or send empty
        fd.append('mainImage', "");
      }

      // 2. Others (Index 1-5)
      // Iterate fixed 5 slots
      const otherItems = galleryItems.slice(1);
      otherItems.forEach(item => {
        if (item && item.file) {
          fd.append('photos', item.file);
        } else if (item && item.path) {
          fd.append('existingPhotos', item.path);
        } else {
          // Item is null (empty slot) or empty path -> Send placeholder to preserve index in 'existing' list
          // Note: New files will still append at the END of this list due to backend logic.
          fd.append('existingPhotos', "");
        }
      });

      // Cleanup: If we are sending ONLY empty strings for existingPhotos (i.e. all deleted), 
      // backend might treat it as ["", "", "", "", ""] which is fine, it effectively clears them visually.

      if (aadharImageFile) fd.append('aadharFront', aadharImageFile);
      if (aadharBackImageFile) fd.append('aadharBack', aadharBackImageFile);
      if (panCardImageFile) fd.append('panFront', panCardImageFile);
      if (panCardBackImageFile) fd.append('panBack', panCardBackImageFile);

      await axios.put(`${USER_API_URL}/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Profile Updated Successfully', 'success');
      // navigate('/users');
    } catch (error) {
      console.error('Submit Error:', error);
      Swal.fire('Error', 'Update Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-slate-800 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm rounded-[20px] mb-6 pb-3 relative overflow-visible">
          <div className="h-32 bg-gray-200 rounded-t-[20px]"></div>
          <div className="absolute top-10 w-full px-4 sm:px-8 flex justify-between items-end">
            <div className="flex-1 pb-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="flex flex-col items-center z-10 shrink-0 mx-2">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 shadow-md"></div>
              <div className="h-6 w-48 bg-gray-200 mt-3 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col items-end gap-2 pb-1">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="mt-24"></div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white shadow-sm rounded-2xl p-6 h-64">
              <div className="h-4 w-32 bg-gray-200 mb-4 rounded"></div>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>)}
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-2xl p-6 h-40"></div>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white shadow-sm rounded-2xl p-6 h-96">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full bg-gray-200 mb-4 rounded-xl"></div>)}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white shadow-sm rounded-2xl p-6 h-96">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full bg-gray-200 mb-4 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-slate-800">

      {/* --- TOP HEADER --- */}
      <div className="bg-white shadow-sm rounded-[20px] mb-6 pb-6 relative overflow-visible flex flex-col">
        <div className="h-32 relative rounded-t-[20px] overflow-hidden group isolate transform-gpu shrink-0">
          {/* Background Image or Gradient */}
          {galleryItems[0]?.preview ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 transition-all duration-700 pointer-events-none"
                style={{ backgroundImage: `url(${galleryItems[0]?.preview})` }}
              />
              {/* White Tint Overlay - No backdrop-blur needed */}
              <div className="absolute inset-0 bg-white/40 mix-blend-overlay" />
              <div className="absolute inset-0 bg-white/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50" />
          )}
        </div>

        {/* Responsive Content Container */}
        <div className="w-full px-4 sm:px-8 -mt-12 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 md:gap-0">

          {/* LEFT: ID (Hidden on mobile, Moved to Name section for better UX on small screens? Or keep as sidebar?) 
              On Mobile: Center it below name or keep top-left of Card?
              Let's keep structure but stack.
          */}
          <div className="flex-1 flex justify-center md:justify-start order-2 md:order-1 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-red-600 px-3 py-2 rounded-lg border border-red-100 shadow-sm transition hover:shadow-md h-fit">
              <span className="font-semibold text-sm">{displayId}</span>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(displayId); Swal.fire({ title: 'Copied', text: 'ID copied to clipboard', icon: 'success', timer: 1500, showConfirmButton: false }); }}
                className="hover:text-red-800 transition"
                title="Copy ID"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* CENTER: Image + Name */}
          <div className="flex flex-col items-center z-10 shrink-0 mx-2 order-1 md:order-2">
            <div className="relative group">
              <img
                src={galleryItems[0]?.preview || 'https://via.placeholder.com/150'}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-gray-200 cursor-pointer"
                onClick={() => galleryItems[0]?.preview && setPreviewImage(galleryItems[0].preview)}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); pickHeaderImage(); }}
                className="absolute bottom-1 right-1 bg-[#f8f9fa] shadow-sm text-gray-700 rounded-full p-2 shadow-md border border-gray-100 hover:text-primary hover:bg-red-50 transition"
                title="Change Photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <h1 className="text-2xl font-bold mt-3 text-gray-900 text-center whitespace-nowrap">{formData.fullName || 'User Name'}</h1>
          </div>

          {/* RIGHT: Membership Details */}
          <div className="flex-1 flex flex-col items-center md:items-end gap-2 pb-1 order-3 w-full md:w-auto">
            {/* Dates */}
            {(fullUser?.isPremium || fullUser?.subscriptionStartsAt || fullUser?.subscription?.startDate) && (
              <div className="flex flex-col items-center md:items-end text-[11px] text-gray-500 font-medium leading-tight">
                {(fullUser?.subscriptionStartsAt || fullUser?.subscription?.startDate) && (
                  <span>Activated: {formatDate(fullUser.subscriptionStartsAt || fullUser.subscription?.startDate)}</span>
                )}
                <span className={fullUser?.isPremium ? "text-indigo-600" : ""}>
                  Expires: {formatDate(fullUser?.premiumExpiresAt || fullUser?.subscription?.endDate)}
                </span>
              </div>
            )}

            {/* Badge */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${fullUser?.isPremium ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {fullUser?.isPremium ? 'Premium Member' : 'Free Member'}
            </span>

            {/* Manage Button */}
            <button
              type="button"
              onClick={() => openSubscriptionDrawer(fullUser)}
              className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <Crown size={14} />
              Manage
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">

          {/* --- COLUMN 1: LEFT SIDEBAR (Gallery, Privacy, Docs) --- */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard
              title={<>Profile Photos <span className="text-red-500">*</span></>}
              subTitle="Required minimum 3 images with clear face."
            >
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => {
                  const item = galleryItems[i];
                  return (
                    <div key={i} className="aspect-square relative rounded-xl overflow-hidden group">
                      {item ? (
                        <div className="w-full h-full relative cursor-pointer" onClick={() => setPreviewImage(item.preview)}>
                          <img src={item.preview} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt={`Profile ${i + 1}`} />

                          {/* Overlay for Main Profile */}
                          {i === 0 && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 flex justify-center backdrop-blur-[2px]">
                              <span className="text-[10px] font-bold text-white tracking-wide uppercase">Main Profile</span>
                            </div>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveGalleryPhoto(i); }}
                            className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/40 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 z-10"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => pickImage(null, null, true)}
                          className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-500 hover:bg-gray-100 transition duration-200"
                        >
                          <FaPlus className="text-xl opacity-50" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Aadhar Card">
              <div className="grid grid-cols-2 gap-2">
                <PhotoPlaceholder
                  label="Front"
                  image={aadharImage}
                  onUpload={() => pickImage(setAadharImage, setAadharImageFile)}
                  onRemove={() => setAadharImage(null)}
                  onView={() => setPreviewImage(aadharImage)}
                />
                <PhotoPlaceholder
                  label="Back"
                  image={aadharBackImage}
                  onUpload={() => pickImage(setAadharBackImage, setAadharBackImageFile)}
                  onRemove={() => setAadharBackImage(null)}
                  onView={() => setPreviewImage(aadharBackImage)}
                />
              </div>
            </SectionCard>

            <SectionCard title="PAN Card (Optional)">
              <div className="grid grid-cols-2 gap-2">
                <PhotoPlaceholder
                  label="Front"
                  image={panCardImage}
                  onUpload={() => pickImage(setPanCardImage, setPanCardImageFile)}
                  onRemove={() => setPanCardImage(null)}
                  onView={() => setPreviewImage(panCardImage)}
                />
                <PhotoPlaceholder
                  label="Back"
                  image={panCardBackImage}
                  onUpload={() => pickImage(setPanCardBackImage, setPanCardBackImageFile)}
                  onRemove={() => setPanCardBackImage(null)}
                  onView={() => setPreviewImage(panCardBackImage)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Privacy Settings">
              <ToggleButton label="Profile Visibility" isActive={privacy.profile} onToggle={(v) => setPrivacy(p => ({ ...p, profile: v }))} activeIcon={FaGlobe} activeColor="bg-red-700" />
              <ToggleButton label="Photo Visibility" isActive={privacy.photo} onToggle={(v) => setPrivacy(p => ({ ...p, photo: v }))} activeIcon={FaLock} activeColor="bg-red-700" />
              <ToggleButton label="Contact Visibility" isActive={privacy.contact} onToggle={(v) => setPrivacy(p => ({ ...p, contact: v }))} activeIcon={FaUserCheck} activeColor="bg-red-700" />
            </SectionCard>



            <button type="submit" className="w-full py-4 rounded-xl bg-[#A52A2A] text-white font-bold text-base shadow-lg hover:bg-[#8B2323] transition mt-4">Update Changes</button>
          </div>

          {/* --- COLUMN 2: MIDDLE (Basic, Religious) --- */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard title="Basic Info">
              <FloatingInput label="Full Name" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required className="mb-4" />
              <FloatingInput label="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required className="mb-4" />
              <FloatingInput label="Phone" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} required className="mb-4" />
              <FloatingSelect label="Profile For" value={formData.profileFor} onChange={(e) => handleChange('profileFor', e.target.value)} required options={[
                { value: 'self', name: 'Self' },
                { value: 'son', name: 'Son' },
                { value: 'daughter', name: 'Daughter' },
                { value: 'brother', name: 'Brother' },
                { value: 'sister', name: 'Sister' },
                { value: 'friend', name: 'Friend' },
                { value: 'relative', name: 'Relative' }
              ]} className="mb-4" />
              <FloatingSelect label="Gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} required options={[{ value: 'Male', name: 'Male' }, { value: 'Female', name: 'Female' }]} className="mb-4" />
              <FloatingDate label="Date of Birth" value={formData.dateOfBirth} onChange={(date) => handleChange('dateOfBirth', date)} required className="mb-4" />

              <div className="mb-4 px-1">
                <div className="flex justify-between text-xs text-primary mb-1 font-semibold"><span>Height</span> <span>{formData.height} cm</span></div>
                <input type="range" min="120" max="220" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>

              <FloatingSelect label="Marital Status" value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} required options={[{ value: 'Never Married', name: 'Never Married' }, { value: 'Divorced', name: 'Divorced' }, { value: 'Widowed', name: 'Widowed' }, { value: 'Awaiting Divorce', name: 'Awaiting Divorce' }]} className="mb-4" />
              {formData.maritalStatus !== 'Never Married' && (
                <FloatingSelect
                  label="Children"
                  value={formData.children}
                  onChange={(e) => handleChange('children', e.target.value)}
                  options={[
                    { value: 'No Children', name: 'No Children' },
                    { value: '1', name: '1' },
                    { value: '2', name: '2' },
                    { value: '3+', name: '3+' }
                  ]}
                  className="mb-4"
                />
              )}
              <FloatingInput multiline rows={3} label="About Me" value={formData.aboutMe} onChange={(e) => handleChange('aboutMe', e.target.value)} required />
            </SectionCard>

            <SectionCard title="Religious & Social">
              <FloatingSelect label="Religion" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} required options={formatSimpleData(allMetaData?.religions)} className="mb-4" />
              <FloatingSelect label="Caste" value={formData.caste} onChange={(e) => handleChange('caste', e.target.value)} required options={formatSimpleData(filteredCastes)} className="mb-4" />
              <FloatingSelect label="Sub Caste" value={formData.subCaste} onChange={(e) => handleChange('subCaste', e.target.value)} options={formatSimpleData(filteredSubCastes)} className="mb-4" />
              <FloatingSelect label="Gotra" value={formData.gotra} onChange={(e) => handleChange('gotra', e.target.value)} options={formatSimpleData(allMetaData?.gotras)} className="mb-4" />
              <FloatingSelect label="Manglik" value={formData.manglik} onChange={(e) => handleChange('manglik', e.target.value)} required options={[{ value: 'Doesnt Matter', name: "Doesn't Matter" }, { value: 'Manglik', name: 'Manglik' }]} className="mb-4" />
              <FloatingSelect label="Mother Tongue" value={formData.motherTongue} onChange={(e) => handleChange('motherTongue', e.target.value)} required options={formatSimpleData(allMetaData?.motherTongues)} className="mb-4" />
              <FloatingSelect label="Raasi" value={formData.raasi} onChange={(e) => handleChange('raasi', e.target.value)} options={formatSimpleData(allMetaData?.raasis)} />
            </SectionCard>
          </div>

          {/* --- COLUMN 3: RIGHT (Career, Family, Lifestyle) --- */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard title="Education & Career">
              <div className="mb-4">
                <ModernMultiSelect label="Education" value={formData.education} onChange={(v) => handleChange('education', v)} data={formatEducationData(allMetaData?.educations)} labelField="label" valueField="value" />
              </div>
              <FloatingSelect label="Profession" value={formData.profession} onChange={(e) => handleChange('profession', e.target.value)} options={formatProfessionData(allMetaData?.professions)} className="mb-4" />
              <FloatingSelect label="Location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} options={formatLocationData(allMetaData?.locations)} className="mb-4" />
              <FloatingInput label="Annual Income" value={formData.annualIncome} onChange={(e) => handleChange('annualIncome', e.target.value)} />
            </SectionCard>

            <SectionCard title="Family Details">
              <FloatingSelect label="Father Status" value={formData.fatherStatus} onChange={(e) => handleChange('fatherStatus', e.target.value)} options={FATHER_STATUS_OPTIONS} className="mb-4" />
              <FloatingSelect label="Mother Status" value={formData.motherStatus} onChange={(e) => handleChange('motherStatus', e.target.value)} options={MOTHER_STATUS_OPTIONS} className="mb-4" />
              <div className="flex gap-4 mb-4">
                <FloatingSelect label="Brothers" value={formData.brothers} onChange={(e) => handleChange('brothers', e.target.value)} options={[{ value: '0', name: '0' }, { value: '1', name: '1' }, { value: '2+', name: '2+' }]} className="w-1/2" />
                <FloatingSelect label="Sisters" value={formData.sisters} onChange={(e) => handleChange('sisters', e.target.value)} options={[{ value: '0', name: '0' }, { value: '1', name: '1' }, { value: '2+', name: '2+' }]} className="w-1/2" />
              </div>
              <FloatingSelect label="Family Type" value={formData.familyType} onChange={(e) => handleChange('familyType', e.target.value)} options={[{ value: 'Nuclear', name: 'Nuclear' }, { value: 'Joint', name: 'Joint' }]} className="mb-4" />
              <FloatingSelect label="Family Values" value={formData.familyValues} onChange={(e) => handleChange('familyValues', e.target.value)} options={FAMILY_VALUES_OPTIONS} className="mb-4" />
              <FloatingSelect label="Family Location" value={formData.familyLocation} onChange={(e) => handleChange('familyLocation', e.target.value)} options={formatLocationData(allMetaData?.locations)} />
            </SectionCard>

            <SectionCard title="Lifestyle">
              <FloatingSelect label="Diet" value={formData.diet} onChange={(e) => handleChange('diet', e.target.value)} options={[{ value: 'Vegetarian', name: 'Vegetarian' }, { value: 'Non-Vegetarian', name: 'Non-Vegetarian' }]} className="mb-4" />
              <FloatingSelect label="Smoking" value={formData.smoking} onChange={(e) => handleChange('smoking', e.target.value)} options={[{ value: 'No', name: 'No' }, { value: 'Yes', name: 'Yes' }]} className="mb-4" />
              <FloatingSelect label="Drinking" value={formData.drinking} onChange={(e) => handleChange('drinking', e.target.value)} options={[{ value: 'No', name: 'No' }, { value: 'Yes', name: 'Yes' }]} />
            </SectionCard>
          </div>

        </div>
      </form>

      {subscriptionDrawerOpen && activeSubscriptionUser && (() => {
        const modal = (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm shadow-xl dark:border-gray-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Subscription Manager</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activeSubscriptionUser.fullName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin-only control. No payment required from the user.</p>
                </div>
                <button type="button" onClick={closeSubscriptionDrawer} className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"><X size={16} /></button>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
                <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{getPlanLabel(activeSubscriptionUser)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getSubscriptionStatus(activeSubscriptionUser).tone}`}>{getSubscriptionStatus(activeSubscriptionUser).label}</span>
                  </div>
                  <div className="grid gap-3 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-3">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-500" /><span>Ends: {formatDate(activeSubscriptionUser.subscription?.endDate || activeSubscriptionUser.premiumExpiresAt)}</span></div>
                    <div className="flex items-center gap-2"><PauseCircle size={14} className="text-gray-500" /><span>Paused till: {formatDate(activeSubscriptionUser.subscription?.pausedUntil)}</span></div>
                    <div className="flex items-center gap-2"><Ban size={14} className="text-gray-500" /><span>Cancel on: {formatDate(activeSubscriptionUser.subscription?.cancelAt)}</span></div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Admin Actions</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: "assign", label: "Assign", icon: Crown, helper: "Grant a plan instantly" },
                      { key: "upgrade", label: "Upgrade", icon: ArrowUpRight, helper: "Move to higher plan" },
                      { key: "downgrade", label: "Downgrade", icon: ArrowDownRight, helper: "Move to lower plan" },
                      { key: "pause", label: "Pause", icon: PauseCircle, helper: "Temporarily stop access" },
                      { key: "extend", label: "Extend", icon: CalendarPlus, helper: "Add extra days" },
                      { key: "cancel", label: "Cancel", icon: Ban, helper: "End subscription" },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button key={action.key} type="button" onClick={() => setSubscriptionForm((prev) => ({ ...prev, action: action.key }))} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${subscriptionForm.action === action.key ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-[#f8f9fa] shadow-sm text-gray-700 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200"}`}>
                          <div className="flex items-center gap-2"><Icon size={16} />{action.label}</div>
                          <p className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">{action.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-4 shadow-sm dark:border-gray-800 dark:bg-slate-900">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["assign", "upgrade", "downgrade"].includes(subscriptionForm.action) && (
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Plan <select value={subscriptionForm.planId} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, planId: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="">Select a plan</option>{plans.map((plan) => (<option key={plan._id} value={plan._id}>{plan.name} - {plan.durationInDays} days</option>))}</select></label>
                    )}
                    {subscriptionForm.action === "extend" && (
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Extend by <select value={subscriptionForm.extendDays} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, extendDays: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="custom">Custom</option></select></label>
                    )}
                    {subscriptionForm.action === "pause" && (
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pause for <select value={subscriptionForm.pauseDays} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, pauseDays: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="custom">Custom</option></select></label>
                    )}
                    {subscriptionForm.action === "cancel" && (
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Cancellation mode <select value={subscriptionForm.cancelMode} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, cancelMode: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="immediate">Immediate</option><option value="end_of_cycle">End of cycle</option></select></label>
                    )}
                    {((subscriptionForm.action === "extend" && subscriptionForm.extendDays === "custom") || (subscriptionForm.action === "pause" && subscriptionForm.pauseDays === "custom")) && (
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Custom days <input type="number" min="1" value={subscriptionForm.customDays} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, customDays: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" placeholder="e.g. 21" /></label>
                    )}
                    <label className="sm:col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Internal note <textarea value={subscriptionForm.note} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, note: e.target.value }))} className="mt-1 min-h-[80px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" placeholder="Log why this change was made." /></label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                <button type="button" onClick={closeSubscriptionDrawer} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300">Close</button>
                <button type="button" onClick={applySubscriptionAction} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">Apply Changes</button>
              </div>
            </div>
          </div>
        );
        if (!portalReady || typeof document === "undefined" || !document.body) return modal;
        return createPortal(modal, document.body);
      })()}
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 transition-all duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition p-2 bg-[#f8f9fa] shadow-sm/10 rounded-full hover:bg-[#f8f9fa] shadow-sm/20"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;
