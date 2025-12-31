import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPencilAlt, FaTimesCircle } from 'react-icons/fa';
import ModernMultiSelect from "../../components/ModernMultiSelect";

const Slider = ({ style, minimumValue, maximumValue, step, value, onValueChange, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor }) => {
  return (
    <input
      type="range"
      min={minimumValue}
      max={maximumValue}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      style={{ ...style, accentColor: minimumTrackTintColor }} 
    />
  );
};

const MultiSelect = ({
  label,
  value = [],
  onChange,
  data = [],
  placeholder,
  labelField = "name",
  valueField = "value",
}) => {
  const handleSelectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onChange(selectedValues);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        multiple
        value={value.map(String)}   // ✅ ensure all are strings
        onChange={handleSelectChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        style={{ minHeight: 100 }}
      >
        <option disabled>{placeholder}</option>
        {data.map((item) => (
          <option
            key={item[valueField] || item._id}
            value={item[valueField] || item._id}
          >
            {item[labelField] || item.name}
          </option>
        ))}
      </select>
    </div>
  );
};


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

const COLORS = {
  primary: '#FF6347', 
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CCCCCC',
  darkGray: '#666666',
  lightGray: '#EEEEEE',
  danger: '#FF0000',
};
const SIZES = {
  padding: '1.5rem',
  base: '0.5rem',
  radius: '0.375rem', 
};
const FONTS = {
  h1: { fontSize: '1.5rem', fontWeight: 'bold' },
  h2: { fontSize: '1.25rem', fontWeight: 'bold' },
  h3: { fontSize: '1.125rem', fontWeight: 'bold' },
  h4: { fontSize: '1rem', fontWeight: 'bold' },
  body3: { fontSize: '0.875rem' },
  body4: { fontSize: '0.75rem' },
  body5: { fontSize: '0.625rem' },
};

const META_API_BASE_URL = `${API_BASE_URL}/api/meta`;
const USER_API_URL = `${API_BASE_URL}/api/user`;

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

const RadioButton = ({ label, selected, onSelect, value }) => (
  <button type="button" onClick={() => onSelect(value)} className="flex items-center mr-4">
    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-2 ${selected === value ? 'border-primary' : 'border-gray-400'}`}>
      {selected === value && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
    </div>
    <span className={`text-sm ${selected === value ? 'text-primary font-semibold' : 'text-gray-600'}`}>{label}</span>
  </button>
);

const CustomPicker = ({ label, selectedValue, onValueChange, items, placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label} {required ? '*' : ''}</label>
    <select
      value={selectedValue}
      onChange={(e) => onValueChange(e.target.value)}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
    >
      <option value="" disabled>{placeholder}</option>
      {items.map(item => (
        <option
          key={item.value || item._id || item.name}
          value={item.value || item._id}
        >
          {item.name || item.label}
        </option>
      ))}
    </select>
  </div>
);

const getInitialImageUri = (user) => {
  if (user?.image) {
    return `${user.image}`;
  }
  return null;
};

const getInitialMultiSelectValue = (field, user, isUserEducation = false) => {
  const data = isUserEducation ? user.education : user?.partnerPreference?.[field];
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => item._id || item);
};

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // --- STATE INITIALIZATION ---
  const [loading, setLoading] = useState(true);
  const [allMetaData, setAllMetaData] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // 1. Basic & Image
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null); 

  // 2. Personal
  const [profileFor, setProfileFor] = useState('Self');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [height, setHeight] = useState(160);
  const [maritalStatus, setMaritalStatus] = useState('Never Married');
  const [children, setChildren] = useState('No Children');

  const [manglik, setManglik] = useState('Doesnt Matter');
  const [gotra, setGotra] = useState('');

  // 3. Background (Single-Select - Populated objects)
  const [selectedReligion, setSelectedReligion] = useState('');
  const [selectedCaste, setSelectedCaste] = useState('');
  const [selectedSubCaste, setSelectedSubCaste] = useState('');
  const [selectedMotherTongue, setSelectedMotherTongue] = useState('');
  const [selectedRaasi, setSelectedRaasi] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Background (Multi-Select - Populated array)
  const [selectedEducation, setSelectedEducation] = useState([]);

  // Text Inputs
  const [annualIncome, setAnnualIncome] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  // 4. Complex Object Fields
  const [fatherStatus, setFatherStatus] = useState('');
  const [motherStatus, setMotherStatus] = useState('');
  const [brothers, setBrothers] = useState('0');
  const [sisters, setSisters] = useState('0');
  const [familyType, setFamilyType] = useState('Nuclear');
  const [familyValues, setFamilyValues] = useState('');
  const [familyLocation, setFamilyLocation] = useState('');

  // Lifestyle
  const [diet, setDiet] = useState('Vegetarian');
  const [smoking, setSmoking] = useState('No');
  const [drinking, setDrinking] = useState('No');

  // ID/Images
  const [aadharImage, setAadharImage] = useState(null);
  const [aadharImageFile, setAadharImageFile] = useState(null);
  const [panCardImage, setPanCardImage] = useState(null);
  const [panCardImageFile, setPanCardImageFile] = useState(null);
  const [newProfilePhotos, setNewProfilePhotos] = useState([]); 
  const [newProfilePhotoFiles, setNewProfilePhotoFiles] = useState([]); 
  const [dbProfilePhotos, setDbProfilePhotos] = useState([]); 
  const [menuVisible, setMenuVisible] = useState(false);

  // 5. PARTNER PREFERENCE STATES (Single Select/Ranges)
  const [prefMaritalStatus, setPrefMaritalStatus] = useState('Never Married');
  const [prefAgeMin, setPrefAgeMin] = useState('18');
  const [prefAgeMax, setPrefAgeMax] = useState('40');
  const [prefHeightMin, setPrefHeightMin] = useState(160);
  const [prefHeightMax, setPrefHeightMax] = useState(180);
  const [prefManglik, setPrefManglik] = useState("Doesn't Matter");
  const [prefAnnualIncome, setPrefAnnualIncome] = useState('');

  // PARTNER PREFERENCE STATES (MultiSelect - Populated arrays)
  const [prefReligions, setPrefReligions] = useState([]);
  const [prefCastes, setPrefCastes] = useState([]);
  const [prefSubCastes, setPrefSubCastes] = useState([]);
  const [prefGotras, setPrefGotras] = useState([]);
  const [prefRaasis, setPrefRaasis] = useState([]);
  const [prefMotherTongues, setPrefMotherTongues] = useState([]);
  const [prefEducations, setPrefEducations] = useState([]);
  const [prefProfessions, setPrefProfessions] = useState([]);
  const [prefLocations, setPrefLocations] = useState([]);

  // --- FETCH USER DATA AND META DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Data
        const userResponse = await axios.get(`${USER_API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data.user;

        // Set User Data to States
        setFullName(user?.fullName || '');
        setEmail(user?.email || '');
        setPhoneNumber(user?.phoneNumber || '');
        setProfileImage(getInitialImageUri(user));

        setProfileFor(user?.profileFor || 'Self');
        setGender(user?.gender || 'Male');
        setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date());
        setHeight(user?.height || 160);
        setMaritalStatus(user?.maritalStatus || 'Never Married');
        setChildren(user?.children || 'No Children');
        setManglik(user?.manglik || 'Doesnt Matter');
        setGotra(user?.gotra?._id || '');

        setSelectedReligion(user?.religion?._id || '');
        setSelectedCaste(user?.caste?._id || '');
        setSelectedSubCaste(user?.subCaste?._id || '');
        setSelectedMotherTongue(user?.motherTongue?._id || '');
        setSelectedRaasi(user?.raasi?._id || '');
        setSelectedProfession(user?.profession?._id || '');
        setSelectedLocation(user?.location?._id || '');
        setSelectedEducation(getInitialMultiSelectValue('education', user, true));

        setAnnualIncome(user?.annualIncome || '');
        setAboutMe(user?.aboutMe || '');

        setFatherStatus(user?.familyDetails?.fatherStatus || '');
        setMotherStatus(user?.familyDetails?.motherStatus || '');
        setBrothers(String(user?.familyDetails?.brothers || '0'));
        setSisters(String(user?.familyDetails?.sisters || '0'));
        setFamilyType(user?.familyDetails?.familyType || 'Nuclear');
        setFamilyValues(user?.familyDetails?.familyValues || '');
        setFamilyLocation(user?.familyDetails?.familyLocation?._id || user?.familyDetails?.familyLocation || '');

        setDiet(user?.lifestyle?.diet || 'Vegetarian');
        setSmoking(user?.lifestyle?.smoking || 'No');
        setDrinking(user?.lifestyle?.drinking || 'No');

        setAadharImage(user?.aadharImage ? `${user.aadharImage}` : null);
        setPanCardImage(user?.pancardImage ? `${user.pancardImage}` : null);
        setDbProfilePhotos(user?.photos?.map(p => `${p}`) || []);

        setPrefMaritalStatus(Array.isArray(user?.partnerPreference?.maritalStatus) ? user.partnerPreference.maritalStatus[0] : user?.partnerPreference?.maritalStatus ||
       'Never Married');
        setPrefAgeMin(String(user?.partnerPreference?.ageRange?.[0] || '18'));
        setPrefAgeMax(String(user?.partnerPreference?.ageRange?.[1] || '40'));
        setPrefHeightMin(user?.partnerPreference?.heightRange?.[0] || 160);
        setPrefHeightMax(user?.partnerPreference?.heightRange?.[1] || 180);
        setPrefManglik(Array.isArray(user?.partnerPreference?.manglik) ? user.partnerPreference.manglik[0] : user?.partnerPreference?.manglik || "Doesn't Matter");
        setPrefAnnualIncome(user?.partnerPreference?.annualIncome || '');

        setPrefReligions(getInitialMultiSelectValue('religion', user));
        setPrefCastes(getInitialMultiSelectValue('caste', user));
        setPrefSubCastes(getInitialMultiSelectValue('subCaste', user));
        setPrefGotras(getInitialMultiSelectValue('gotra', user));
        setPrefRaasis(getInitialMultiSelectValue('raasi', user));
        setPrefMotherTongues(getInitialMultiSelectValue('motherTongue', user));
        setPrefEducations(getInitialMultiSelectValue('education', user));
        setPrefProfessions(getInitialMultiSelectValue('profession', user));
        setPrefLocations(getInitialMultiSelectValue('location', user));

        // Fetch Meta Data
        const metaResponse = await axios.get(`${META_API_BASE_URL}/profile-meta`);
        console.log(`metaResponse`, metaResponse.data)
        setAllMetaData(metaResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch user or meta data.", "error");
      } finally {
        setLoading(false);
        setLoadingMeta(false);
      }
    };
    fetchData();
  }, [id, token]);

  // --- IMAGE PICKER FUNCTIONS ---
  const pickImage = async (setImageUri, setImageFile, isMultiple = false) => {
    try {
      const result = await launchImageLibrary({ selectionLimit: isMultiple ? 0 : 1 });

      if (result.assets && result.assets.length > 0) {
        if (isMultiple) {
          setNewProfilePhotos(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
          setNewProfilePhotoFiles(prev => [...prev, ...result.assets.map(asset => asset.file)]);
        } else {
          setImageUri(result.assets[0].uri);
          setImageFile(result.assets[0].file);
        }
      }
    } catch (err) {
      console.error('Error picking image: ', err);
    }
  };

  const removeProfileImage = async () => {
    try {
      const response = await axios.delete(`${USER_API_URL}/${id}/image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProfileImage(null);
        setProfileImageFile(null);
        Swal.fire('Success', 'Profile image removed successfully.', 'success');
      } else {
        Swal.fire('Error', response.data.message || 'Failed to remove image.', 'error');
      }
    } catch (error) {
      console.error('Error removing profile image:', error.response?.data || error);
      Swal.fire('Error', 'Something went wrong while removing the image.', 'error');
    }
    setMenuVisible(false);
  };

  const removeIdImage = async (imageType) => {
    try {
      const response = await axios.delete(`${USER_API_URL}/${id}/id-image`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { imageType },
      });
      if (response.data.success) {
        if (imageType === 'aadharImage') {
          setAadharImage(null);
          setAadharImageFile(null);
        } else if (imageType === 'pancardImage') {
          setPanCardImage(null);
          setPanCardImageFile(null);
        }
        Swal.fire('Success', `${imageType === 'aadharImage' ? 'Aadhar' : 'PAN'} card image removed successfully.`, 'success');
      } else {
        Swal.fire('Error', response.data.message || 'Failed to remove image.', 'error');
      }
    } catch (error) {
      console.error(`Error removing ${imageType}:`, error.response?.data || error);
      Swal.fire('Error', `Something went wrong while removing the ${imageType === 'aadharImage' ? 'Aadhar' : 'PAN'} card image.`, 'error');
    }
  };

  const handleDeleteDbPhoto = async (photoUri) => {
    try {
      const response = await axios.delete(`${USER_API_URL}/${id}/additional-photo`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { photoUri },
      });
      if (response.data.success) {
        setDbProfilePhotos(dbProfilePhotos.filter(p => p !== photoUri));
        Swal.fire('Success', 'Photo removed from server.', 'success');
      } else {
        Swal.fire('Error', response.data.message || 'Failed to remove image.', 'error');
      }
    } catch (error) {
      console.error('Delete DB photo error:', error);
      Swal.fire('Error', 'Failed to delete photo from server.', 'error');
    }
  };

  const handleDeleteNewPhoto = (photoUri) => {
    setNewProfilePhotos(newProfilePhotos.filter(p => p !== photoUri));
    setNewProfilePhotoFiles(newProfilePhotoFiles.filter(file => URL.createObjectURL(file) !== photoUri));
    Swal.fire('Removed', 'Photo removed locally.', 'info');
  };

  // Helper to structure metadata for MultiSelect
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      // BASIC, PERSONAL, BACKGROUND
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('profileFor', profileFor);
      formData.append('gender', gender);
      formData.append('dateOfBirth', dateOfBirth.toISOString().split('T')[0]);
      formData.append('height', height.toString());
      formData.append('maritalStatus', maritalStatus);
      formData.append('manglik', manglik);
      formData.append('religion', selectedReligion);
      formData.append('caste', selectedCaste);
      formData.append('subCaste', selectedSubCaste);
      formData.append('motherTongue', selectedMotherTongue);
      formData.append('raasi', selectedRaasi);
      formData.append('gotra', gotra);
      formData.append('profession', selectedProfession);
      formData.append('education', JSON.stringify(selectedEducation));
      formData.append('location', selectedLocation);
      formData.append('annualIncome', annualIncome);
      formData.append('aboutMe', aboutMe);
      formData.append('children', children);

      // COMPLEX FIELDS (JSON strings)
      formData.append('familyDetails', JSON.stringify({
        fatherStatus, motherStatus, brothers, sisters, familyType, familyValues, familyLocation
      }));
      formData.append('lifestyle', JSON.stringify({ diet, smoking, drinking }));

      // PARTNER PREFERENCES (JSON string)
      formData.append('partnerPreference', JSON.stringify({
        maritalStatus: prefMaritalStatus,
        ageRange: [parseInt(prefAgeMin, 10), parseInt(prefAgeMax, 10)],
        heightRange: [prefHeightMin, prefHeightMax],
        religion: prefReligions,
        caste: prefCastes,
        gotra: prefGotras,
        subCaste: prefSubCastes,
        motherTongue: prefMotherTongues,
        raasi: prefRaasis,
        education: prefEducations,
        profession: prefProfessions,
        location: prefLocations,
        manglik: prefManglik,
        annualIncome: prefAnnualIncome,
      }));

      // IMAGE UPLOADS
      if (profileImageFile) {
        formData.append('image', profileImageFile);
      }
      if (aadharImageFile) {
        formData.append('aadharImage', aadharImageFile);
      }
      if (panCardImageFile) {
        formData.append('pancardImage', panCardImageFile);
      }
      newProfilePhotoFiles.forEach((file) => {
        formData.append('photos', file);
      });

      await axios.put(`${USER_API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire('Success', 'User profile updated successfully!', 'success');
      navigate('/users');
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update user profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingMeta) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-primary text-lg">Loading user data and options...</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Edit User Profile</h2>

      {/* SECTION: Basic & Profile Photo */}
      <div className="flex flex-col items-center mb-6 relative w-24 mx-auto">
        <img
          src={profileImage || 'https://via.placeholder.com/100'} 
          alt="Profile"
          className="w-24 h-24 rounded-full bg-gray-200 object-cover"
        />
        <button
          type="button"
          onClick={() => setMenuVisible(true)}
          className="absolute bottom-0 right-0 bg-primary rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
        >
          <FaPencilAlt className="text-white text-sm" />
        </button>
      </div>
      {menuVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <button
              className="block w-full py-3 border-b border-gray-200 text-primary text-center"
              onClick={() => {
                pickImage(setProfileImage, setProfileImageFile);
                setMenuVisible(false);
              }}
            >
              Upload Image
            </button>
            <button
              className="block w-full py-3 text-primary text-center"
              onClick={removeProfileImage}
            >
              Remove Image
            </button>
            <button
              className="block w-full py-3 text-gray-600 text-center mt-4"
              onClick={() => setMenuVisible(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Basic Info</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number" />
        </div>
      </div>

     

      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Background Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <CustomPicker
          label="Religion " required
          selectedValue={selectedReligion} onValueChange={setSelectedReligion}
          items={formatSimpleData(allMetaData?.religions)}
          placeholder="Select Religion"
        />

        <CustomPicker
          label="Caste " required
          selectedValue={selectedCaste} onValueChange={setSelectedCaste}
          items={formatSimpleData(allMetaData?.castes)}
          placeholder="Select Caste"
        />

        <CustomPicker
          label="Sub Caste"
          selectedValue={selectedSubCaste} onValueChange={setSelectedSubCaste}
          items={formatSimpleData(allMetaData?.subCastes)}
          placeholder="Select Sub Caste"
        />

        <CustomPicker
          label="Gotra"
          selectedValue={gotra}
          onValueChange={setGotra}
          items={formatSimpleData(allMetaData?.gotras)}
          placeholder="Select Gotra"
        />

        <CustomPicker
          label="Mother Tongue " required
          selectedValue={selectedMotherTongue} onValueChange={setSelectedMotherTongue}
          items={formatSimpleData(allMetaData?.motherTongues)}
          placeholder="Select Mother Tongue"
        />

        <CustomPicker
          label="Raasi/Moon Sign"
          selectedValue={selectedRaasi} onValueChange={setSelectedRaasi}
          items={formatSimpleData(allMetaData?.raasis)}
          placeholder="Select Raasi"
        />
      


      <ModernMultiSelect
        label="Education"
        value={selectedEducation}
        onChange={setSelectedEducation}
        data={formatEducationData(allMetaData?.educations)}
        labelField="label"
        valueField="value"
      />
</div>
      <div className="grid grid-cols-3 gap-4">
        <CustomPicker
          label="Profession " required
          selectedValue={selectedProfession} onValueChange={setSelectedProfession}
          items={formatProfessionData(allMetaData?.professions)}
          placeholder="Select Profession"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Annual Income (Optional)</label>
          <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} placeholder="e.g., 5,00,000 - 10,00,000" />
        </div>

        <CustomPicker
          label="Current Location " required
          selectedValue={selectedLocation} onValueChange={setSelectedLocation}
          items={formatLocationData(allMetaData?.locations)}
          placeholder="Select Location"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">About Me</label>
        <textarea className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="3" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="Tell us about yourself and your family values (max 500 characters)" maxLength={500} />
      </div>


      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Family Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <CustomPicker
          label="Father Status" required
          selectedValue={fatherStatus} onValueChange={setFatherStatus}
          items={FATHER_STATUS_OPTIONS}
          placeholder="Select Father's Status"
        />

        <CustomPicker
          label="Mother Status" required
          selectedValue={motherStatus} onValueChange={setMotherStatus}
          items={MOTHER_STATUS_OPTIONS}
          placeholder="Select Mother's Status"
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomPicker
            label="Brothers" required
            selectedValue={brothers} onValueChange={setBrothers}
            items={[{ value: '0', name: 'None' }, { value: '1', name: '1' }, { value: '2', name: '2' }, { value: '3+', name: '3+' }]}
            placeholder="Select number of brothers"
          />
          <CustomPicker
            label="Sisters" required
            selectedValue={sisters} onValueChange={setSisters}
            items={[{ value: '0', name: 'None' }, { value: '1', name: '1' }, { value: '2', name: '2' }, { value: '3+', name: '3+' }]}
            placeholder="Select number of sisters"
          />
        </div>

        <CustomPicker
          label="Family Type" required
          selectedValue={familyType} onValueChange={setFamilyType}
          items={[{ value: 'Nuclear', name: 'Nuclear' }, { value: 'Joint', name: 'Joint' }]}
          placeholder="Select Family Type"
        />

        <CustomPicker
          label="Family Values" required
          selectedValue={familyValues} onValueChange={setFamilyValues}
          items={FAMILY_VALUES_OPTIONS}
          placeholder="Select Family Values"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Family Location (Optional)</label>
          <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={familyLocation} onChange={(e) => setFamilyLocation(e.target.value)} placeholder="e.g., Delhi, India" />
        </div>
      </div>

      {/* SECTION: Lifestyle */}
      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Lifestyle</h3>
      <div className="grid grid-cols-3 gap-4">
        <CustomPicker
          label="Diet" required
          selectedValue={diet} onValueChange={setDiet}
          items={[{ value: 'Vegetarian', name: 'Vegetarian' }, { value: 'Non-Vegetarian', name: 'Non-Vegetarian' }, { value: 'Eggetarian', name: 'Eggetarian' }]}
          placeholder="Select Diet"
        />

        <CustomPicker
          label="Smoking" required
          selectedValue={smoking} onValueChange={setSmoking}
          items={[{ value: 'No', name: 'No' }, { value: 'Yes', name: 'Yes' }, { value: 'Occasionally', name: 'Occasionally' }]}
          placeholder="Smoking Habits"
        />

        <CustomPicker
          label="Drinking" required
          selectedValue={drinking} onValueChange={setDrinking}
          items={[{ value: 'No', name: 'No' }, { value: 'Yes', name: 'Yes' }, { value: 'Occasionally', name: 'Occasionally' }]}
          placeholder="Drinking Habits"
        />
      </div>

      {/* SECTION: ID Proofs & Additional Photos */}
      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">ID Proofs & Photos</h3>
<div className="grid grid-cols-3 gap-4">

      {/* Aadhar Image */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Aadhar Card Image</label>
        <div className="mt-1 flex items-center">
          {aadharImage ? (
            <div className="relative">
              <img src={aadharImage} alt="Aadhar" className="w-24 h-24 object-cover rounded mr-4" />
              <button type="button" onClick={() => removeIdImage('aadharImage')} className="absolute -top-2 -right-2 text-danger bg-white rounded-full">
                <FaTimesCircle size="lg" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mr-4 text-gray-500 text-xs">No Image</div>
          )}
          <button type="button" onClick={() => pickImage(setAadharImage, setAadharImageFile)} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">
            {aadharImage ? 'Change Image' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* PAN Card Image */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">PAN Card Image</label>
        <div className="mt-1 flex items-center">
          {panCardImage ? (
            <div className="relative">
              <img src={panCardImage} alt="PAN Card" className="w-24 h-24 object-cover rounded mr-4" />
              <button type="button" onClick={() => removeIdImage('pancardImage')} className="absolute -top-2 -right-2 text-danger bg-white rounded-full">
                <FaTimesCircle size="lg" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center mr-4 text-gray-500 text-xs">No Image</div>
          )}
          <button type="button" onClick={() => pickImage(setPanCardImage, setPanCardImageFile)} className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300">
            {panCardImage ? 'Change Image' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* Additional Photos */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Profile Photos</label>
        <div className="flex flex-wrap gap-3">
          {/* Photos from DB */}
          {dbProfilePhotos.map((photoUri, index) => (
            <div key={`db-${index}`} className="relative">
              <img src={photoUri} alt={`Profile Photo ${index + 1}`} className="w-20 h-20 object-cover rounded" />
              <button type="button" onClick={() => handleDeleteDbPhoto(photoUri)} className="absolute -top-2 -right-2 text-danger bg-white rounded-full">
                <FaTimesCircle size="sm" />
              </button>
            </div>
          ))}
          {/* New Photos to be Uploaded */}
          {newProfilePhotos.map((photoUri, index) => (
            <div key={`new-${index}`} className="relative">
              <img src={photoUri} alt={`New Photo ${index + 1}`} className="w-20 h-20 object-cover rounded border-2 border-primary opacity-75" />
              <button type="button" onClick={() => handleDeleteNewPhoto(photoUri)} className="absolute -top-2 -right-2 text-danger bg-white rounded-full">
                <FaTimesCircle size="sm" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-primary font-bold">New</div>
            </div>
          ))}
          <button type="button" onClick={() => pickImage(null, null, true)} className="w-20 h-20 bg-gray-100 rounded border border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-200">
            + Add Photo
          </button>
        </div>
      </div>
</div>

      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Partner Preference</h3>
 <div className="grid grid-cols-3 gap-4 mb-4">  


      <CustomPicker
        label="Preferred Marital Status " required
        selectedValue={prefMaritalStatus} onValueChange={setPrefMaritalStatus}
        items={[{ value: 'Never Married', name: 'Never Married' }, { value: 'Divorced', name: 'Divorced' }, { value: 'Widowed', name: 'Widowed' }, { value: 'Awaiting Divorce'
       , name: 'Awaiting Divorce' }, { value: 'Doesnt Matter', name: 'Doesn\'t Matter' }]}
        placeholder="Select Preferred Marital Status"
      />
     
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Min Age</label>
          <input type="number" min="18" max="60" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={prefAgeMin} onChange={(e) => setPrefAgeMin(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Max Age</label>
          <input type="number" min="18" max="60" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={prefAgeMax} onChange={(e) => setPrefAgeMax(e.target.value)} />
        </div>
 
 </div>
      {/* SECTION: Partner Preference */}


      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Preferred Height Range: {prefHeightMin} cm - {prefHeightMax} cm</label>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={120}
          maximumValue={220}
          step={1}
          value={prefHeightMin}
          onValueChange={setPrefHeightMin}
          minimumTrackTintColor={COLORS.gray}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.gray}
        />
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={120}
          maximumValue={220}
          step={1}
          value={prefHeightMax}
          onValueChange={setPrefHeightMax}
          minimumTrackTintColor={COLORS.gray}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.gray}
        />
      </div>

 <div className="grid grid-cols-3 gap-4">
      <ModernMultiSelect
        label="Preferred Religions"
        value={prefReligions}
        onChange={setPrefReligions}
        data={formatSimpleData(allMetaData?.religions)}
        labelField="name"
        valueField="value"
      />

      <ModernMultiSelect
        label="Preferred Castes"
        value={prefCastes}
        onChange={setPrefCastes}
        data={formatSimpleData(allMetaData?.castes)}
        labelField="name"
        valueField="value"
      />

      <ModernMultiSelect
        label="Preferred Sub Castes"
        value={prefSubCastes}
        onChange={setPrefSubCastes}
        data={formatSimpleData(allMetaData?.subCastes)}
        labelField="name"
        valueField="value"
      />
</div>
 <div className="grid grid-cols-3 gap-4">
  
      <ModernMultiSelect
        label="Preferred Mother Tongues"
        value={prefMotherTongues}
        onChange={setPrefMotherTongues}
        data={formatSimpleData(allMetaData?.motherTongues)}
        labelField="name"
        valueField="value"
      />

      <ModernMultiSelect
        label="Preferred Raasis"
        value={prefRaasis}
        onChange={setPrefRaasis}
        data={formatSimpleData(allMetaData?.raasis)}
        labelField="name"
        valueField="value"
      />
<ModernMultiSelect
  label="Preferred Gotras"
  value={prefGotras}
  onChange={setPrefGotras}
  data={formatSimpleData(allMetaData?.gotras)}
  labelField="name"
  valueField="value"
  placeholder="Select Gotra(s)"
/>
</div>

 <div className="grid grid-cols-3 gap-4">

      <CustomPicker
        label="Preferred Manglik Status " required
        selectedValue={prefManglik} onValueChange={setPrefManglik}
        items={[{ value: 'Doesnt Matter', name: 'Doesn\'t Matter' }, { value: 'Manglik', name: 'Manglik' }, { value: 'Non Manglik', name: 'Non Manglik' }]}
        placeholder="Select Preferred Manglik Status"
      />

      <ModernMultiSelect
        label="Preferred Education"
        value={prefEducations}
        onChange={setPrefEducations}
        data={formatEducationData(allMetaData?.educations)}
        labelField="label"
        valueField="value"
      />
  <ModernMultiSelect
        label="Preferred Locations"
        value={prefLocations}
        onChange={setPrefLocations}
        data={formatLocationData(allMetaData?.locations)}
        labelField="name"
        valueField="value"
      />
 </div>
 <div className="grid grid-cols-2 gap-4">
      <ModernMultiSelect
        label="Preferred Professions"
        value={prefProfessions}
        onChange={setPrefProfessions}
        data={formatProfessionData(allMetaData?.professions)}
        labelField="name"
        valueField="value"
      />

    
      <div className="mb-4 ">
        <label className="block text-sm font-medium text-gray-700">Preferred Annual Income (Optional)</label>
       

        <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={prefAnnualIncome} onChange={(e) => setPrefAnnualIncome(e.target.value)}
       placeholder="e.g., 5,00,000+" />
      
      </div>
 </div>
 
      

      <div className="mt-6">
        <button type="submit" disabled={loading} className="w-40 py-3 bg-primary text-white font-bold rounded-md shadow-md hover:bg-red-700 disabled:bg-gray-400">
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
          </form>
      </div>
      

  );
};

export default EditUser;


