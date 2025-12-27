// src/CreateProfile.jsx
import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from "../../components/Config";
import axios from "axios";

const GENDERS = ['Male', 'Female', 'Other'];
const MARITALS = ['Never Married','Divorced','Widowed','Awaiting Divorce'];
const DIETS = ['Vegetarian','Non-Vegetarian','Eggetarian','Vegan','Jain'];
const YES_NO_OCC = ['Yes','No','Occasionally'];
const PARTNER_MARITALS = ['Never Married','Divorced','Widowed','Awaiting Divorce'];

const initialForm = {
  userId: '',
  profileFor: '',
  fullName: '',
  gender: '',
  dateOfBirth: '',
  height: 0,
  maritalStatus: 'Never Married',
  religion: '',
  caste: '',
  subCaste: '',
  motherTongue: '',
  raasi: '',
  manglik: 'Doesnt Matter',
  education: '',
  profession: '',
  annualIncome: '',
  location: '',
  aboutMe: '',
  familyDetails: {
    fatherStatus: '',
    motherStatus: '',
    brothers: 0,
    sisters: 0,
    familyType: 'Nuclear',
    familyValues: ''
  },
  lifestyle: {
    diet: '',
    smoking: 'No',
    drinking: 'No'
  },
  photos: [], // NOTE: non-upload preview only
  partnerPreferences: {
    ageRange: { min: '', max: '' },
    heightRange: { min: '', max: '' },
    maritalStatus: [],
    religion: [],
    caste: [],
    subCaste:[],
    education: [],
    profession: [],
    location: [],
    diet: []
  }
};

export default function CreateProfile() {
  const [form, setForm] = useState(initialForm);

  // Use user token/id for user profile (not admin)
   const token = localStorage.getItem("authToken");
  const storedUserId = localStorage.getItem('user_id');
const [ppSubCastes, setPpSubCastes] = useState([]); 
const [allCastes, setAllCastes] = useState([]);       // master
const [allSubCastes, setAllSubCastes] = useState([]); // master
  const [religions, setReligions] = useState([]);
  const [castes, setCastes] = useState([]);
  const [subCastes, setSubCastes] = useState([]);
  const [motherTongues, setMotherTongues] = useState([]);
  const [raasis, setRaasis] = useState([]);
  const [educations, setEducations] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [locations, setLocations] = useState([]);
const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [rel, mt, rs, ed, pf, loc,cst, scst] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/religion`),
          axios.get(`${API_BASE_URL}/api/mothertongue`),
          axios.get(`${API_BASE_URL}/api/raasi`),
          axios.get(`${API_BASE_URL}/api/education`),
          axios.get(`${API_BASE_URL}/api/profession`),
          axios.get(`${API_BASE_URL}/api/location`, { params: { q: '' } }),
             axios.get(`${API_BASE_URL}/api/cast`),       // <-- all castes (each item should have religionId)
        axios.get(`${API_BASE_URL}/api/subcast`), 
         
        ]);
      
        setReligions(rel.data.religions || []);
        setMotherTongues(mt.data.motherTongues || []);
        setRaasis(rs.data.raasis || []);
        setEducations(ed.data.educations || []);
        setProfessions(pf.data.professions || []);
        setLocations(loc.data.locations || []);
           setAllCastes(cst.data.castes || cst.data || []);
      setAllSubCastes(scst.data.subCastes || scst.data || []);
   
      } catch (e) {
        console.error('Load lists error:', e?.response?.data || e.message);
        setErr('Failed to load lists');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
// when religion changes → fetch castes (filtered) and reset caste/subcaste
useEffect(() => {
  if (!form.religion) {
    setCastes([]);
    setSubCastes([]);
    setForm(prev => ({
      ...prev,
      caste: '',
      subCaste: '',
      partnerPreferences: {
        ...prev.partnerPreferences,
        subCaste: []
      }
    }));
    return;
  }

  axios.get(`${API_BASE_URL}/api/cast/castes`, { params: { religionId: form.religion }})
    .then(r => {
      setCastes(r.data?.castes || r.data || []);
      // reset caste + subcaste
      setSubCastes([]);
      setForm(prev => ({
        ...prev,
        caste: '',
        subCaste: '',
        partnerPreferences: { ...prev.partnerPreferences, subCaste: [] }
      }));
    })
    .catch(err => console.error('Fetch castes error:', err?.response?.data || err.message));
}, [form.religion]);

// when caste changes → fetch subcastes (filtered) and reset selections
useEffect(() => {
  if (!form.caste) {
    setSubCastes([]);
    setForm(prev => ({
      ...prev,
      subCaste: '',
      partnerPreferences: { ...prev.partnerPreferences, subCaste: [] }
    }));
    return;
  }

  axios.get(`${API_BASE_URL}/api/subcast/subcastes`, { params: { casteId: form.caste }})
    .then(r => {
      setSubCastes(r.data?.subCastes || r.data || []);
      // reset self subcaste (single) to avoid stale mismatch
      setForm(prev => ({
        ...prev,
        subCaste: '',
        partnerPreferences: { ...prev.partnerPreferences, subCaste: [] }
      }));
    })
    .catch(err => console.error('Fetch subcastes error:', err?.response?.data || err.message));
}, [form.caste]);

const onPickPhotos = (e) => {
  const files = Array.from(e.target.files || []);
  setSelectedFiles(files);
};

useEffect(() => {
  const selectedCasteIds = form.partnerPreferences.caste || [];
  if (!selectedCasteIds.length) {
    setPpSubCastes([]);
    setForm(prev => ({
      ...prev,
      partnerPreferences: { ...prev.partnerPreferences, subCaste: [] }
    }));
    return;
  }
  const ids = selectedCasteIds.join(',');
  axios.get(`${API_BASE_URL}/api/subcastes`, { params: { casteIds: ids }})
    .then(r => setPpSubCastes(r.data?.subCastes || r.data || []))
    .catch(err => console.error('PP fetch subcastes error:', err?.response?.data || err.message));
}, [form.partnerPreferences.caste]);
const toggleInArray = (arr = [], val) => {
  const i = arr.indexOf(val);
  if (i === -1) return [...arr, val];
  const copy = [...arr];
  copy.splice(i, 1);
  return copy;
};

const CheckboxGroup = ({ options = [], selected = [], onToggle, labelKey = 'label', valueKey = 'value' }) => (
  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
    {(options || []).map(opt => {
      const val = opt[valueKey];
      const lab = opt[labelKey];
      const checked = (selected || []).includes(val);
      return (
        <label key={val} style={{display:'flex', alignItems:'center', gap:8}}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(val)}
          />
          <span>{lab}</span>
        </label>
      );
    })}
  </div>
);

const ppRelIds = form.partnerPreferences.religion || [];
const ppCasteIds = form.partnerPreferences.caste || [];

// 2.1 Filtered Caste options: agar koi religion select nahi -> saare castes
const ppFilteredCastes = useMemo(() => {
  if (!ppRelIds.length) return allCastes;
  return allCastes.filter(c =>
    ppRelIds.includes(c.religionId || c?.religion?._id)
  );
}, [allCastes, ppRelIds]);

// 2.2 Filtered SubCaste options:
//   priority: caste selection -> usi ke subcastes
//   warna religion selection -> un religions ke castes ke subcastes
//   warna: sab subcastes
const ppFilteredSubCastes = useMemo(() => {
  if (ppCasteIds.length) {
    return allSubCastes.filter(sc => ppCasteIds.includes(sc.casteId || sc?.caste?._id));
  }
  if (ppRelIds.length) {
    const allowedCasteIds = new Set(
      allCastes
        .filter(c => ppRelIds.includes(c.religionId || c?.religion?._id))
        .map(c => c._id || c.id)
    );
    return allSubCastes.filter(sc => allowedCasteIds.has(sc.casteId || sc?.caste?._id));
  }
  return allSubCastes;
}, [allSubCastes, allCastes, ppRelIds, ppCasteIds]);
// Agar filtered castes change hue aur selected caste me koi aisa id ho jo ab allowed nahi, to remove it
useEffect(() => {
  const allowed = new Set(ppFilteredCastes.map(c => c._id || c.id));
  setForm(prev => ({
    ...prev,
    partnerPreferences: {
      ...prev.partnerPreferences,
      caste: (prev.partnerPreferences.caste || []).filter(id => allowed.has(id))
    }
  }));
}, [ppFilteredCastes]);

// SubCaste cleanup
useEffect(() => {
  const allowed = new Set(ppFilteredSubCastes.map(sc => sc._id || sc.id));
  setForm(prev => ({
    ...prev,
    partnerPreferences: {
      ...prev.partnerPreferences,
      subCaste: (prev.partnerPreferences.subCaste || []).filter(id => allowed.has(id))
    }
  }));
}, [ppFilteredSubCastes]);
const handleChange = (name, value) => {
  setForm(prev => ({ ...prev, [name]: value }));
};

  const handleNested = (path, value) => {
    const [root, key] = path.split('.');
    setForm(prev => ({
      ...prev,
      [root]: { ...prev[root], [key]: value }
    }));
  };

  const handlePartnerPreferencesChange = (path, value) => {
    const keys = path.split('.');
    setForm(prev => {
      const clone = { ...prev };
      let ref = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...(ref[keys[i]] || {}) };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return clone;
    });
  };


  
  const canSubmit = useMemo(() => {
    return (
      form.fullName &&
      form.gender &&
      form.dateOfBirth &&
      form.religion &&
      form.caste &&
      form.subCaste &&
      form.motherTongue &&
      form.location
    );
  }, [form]);

 const submit = async (e) => {
  e.preventDefault();
  setErr('');

  try {
    setSaving(true);

    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User ID not found');

    // date ko ISO me bhej do
    const payload = { ...form, userId };
    if (payload.dateOfBirth && typeof payload.dateOfBirth === 'string') {
      payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
    }

    const fd = new FormData();

    // flat primitive fields
    const flatKeys = [
      'userId','profileFor','fullName','gender','dateOfBirth','height',
      'maritalStatus','religion','caste','subCaste','motherTongue','raasi',
      'manglik','education','profession','annualIncome','location','aboutMe'
    ];
    flatKeys.forEach(k => payload[k] !== undefined && fd.append(k, payload[k]));

    // nested objects as JSON
    fd.append('familyDetails', JSON.stringify(payload.familyDetails));
    fd.append('lifestyle', JSON.stringify(payload.lifestyle));
    fd.append('partnerPreferences', JSON.stringify(payload.partnerPreferences));

    // attach files
    selectedFiles.forEach(f => fd.append('photos', f));

    const token = localStorage.getItem('user_token');
    const res = await axios.post(`${API_BASE_URL}/api/profile`, fd, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data'
      }
    });

    alert('Profile created!');
    console.log('Saved profile:', res.data.profile);
  } catch (e2) {
    console.error(e2);
    setErr(e2?.response?.data?.message || 'Failed to save');
  } finally {
    setSaving(false);
  }
};

  if (loading) return <p style={{padding:16}}>Loading lists…</p>;

  return (
    <form onSubmit={submit} style={{maxWidth: 900, margin: '0 auto', padding: 16}}>
      <h2>Create Profile</h2>
      {err ? <div style={{color:'crimson', marginBottom:12}}>{err}</div> : null}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div>
          <label>Profile For</label>
          <input type="text" value={form.profileFor} onChange={e => handleChange('profileFor', e.target.value)} placeholder="Self / Son / Daughter / Relative"/>
        </div>
        <div>
          <label>Full Name *</label>
          <input type="text" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} required/>
        </div>
        <div>
          <label>Gender *</label>
          <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} required>
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label>Date of Birth *</label>
          <input type="date" value={form.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} required/>
        </div>
        <div>
          <label>Height (e.g., 170 cm)</label>
          <input type="number" value={form.height} onChange={e => handleChange('height', e.target.value)} />
        </div>
        <div>
          <label>Marital Status</label>
          <select value={form.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)}>
            {MARITALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
       <div>
  <label>Religion *</label>
  <select value={form.religion} onChange={e => handleChange('religion', e.target.value)} required>
    <option value="">Select</option>
    {religions.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>)}
  </select>
</div>

       <div>
  <label>Caste *</label>
  <select
    value={form.caste}
    onChange={e => handleChange('caste', e.target.value)}
    required
  >
    <option value="">Select caste</option>
    {castes.map(c => (
      <option key={c._id || c.id} value={c._id || c.id}>
        {c.name}{c.category ? ` (${c.category})` : ''}
      </option>
    ))}
  </select>
</div>

    <div>
  <label>SubCaste *</label>
  <select
    value={form.subCaste}
    onChange={e => handleChange('subCaste', e.target.value)}
    required
  >
    <option value="">Select subcaste</option>
    {subCastes.map(sc => (
      <option key={sc._id || sc.id} value={sc._id || sc.id}>
        {sc.name}
      </option>
    ))}
  </select>
</div>

        <div>
          <label>Mother Tongue *</label>
          <select value={form.motherTongue} onChange={e => handleChange('motherTongue', e.target.value)} required>
            <option value="">Select</option>
            {motherTongues.map(mt => <option key={mt._id} value={mt._id}>{mt.name}</option>)}
          </select>
        </div>
        <div>
          <label>Raasi</label>
          <select value={form.raasi} onChange={e => handleChange('raasi', e.target.value)}>
            <option value="">Select</option>
            {raasis.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label>Manglik</label>
          <select value={form.manglik} onChange={e => handleChange('manglik', e.target.value)}>
            <option>Doesnt Matter</option>
            <option>Manglik</option>
            <option>Non Manglik</option>
            <option>Angshik (Partial Manglik)</option>
          </select>
        </div>
        <div>
          <label>Education</label>
          <select value={form.education} onChange={e => handleChange('education', e.target.value)}>
            <option value="">Select</option>
            {educations.map(ed => (<option key={ed._id} value={ed._id}>{ed.degree}{ed.field ? ` — ${ed.field}` : ''}</option>))}
          </select>
        </div>
        <div>
          <label>Profession</label>
          <select value={form.profession} onChange={e => handleChange('profession', e.target.value)}>
            <option value="">Select</option>
            {professions.map(p => (<option key={p._id} value={p._id}>{p.occupation}{p.industry ? ` — ${p.industry}` : ''}</option>))}
          </select>
        </div>
        <div>
          <label>Annual Income</label>
          <input type="text" value={form.annualIncome} onChange={e => handleChange('annualIncome', e.target.value)} placeholder="₹ (optional)"/>
        </div>
        <div>
          <label>Location *</label>
          <select value={form.location} onChange={e => handleChange('location', e.target.value)} required>
            <option value="">Select</option>
            {locations.map(l => (<option key={l._id} value={l._id}>{l.city}, {l.state}</option>))}
          </select>
        </div>
        <div style={{gridColumn:'1 / -1'}}>
          <label>About Me (max 500 chars)</label>
          <textarea value={form.aboutMe} onChange={e => handleChange('aboutMe', e.target.value)} maxLength={500} rows={4} placeholder="Describe yourself..."/>
        </div>

        {/* Family & Lifestyle */}
        <div>
          <label>Father Status</label>
          <input type="text" value={form.familyDetails.fatherStatus} onChange={e => handleNested('familyDetails.fatherStatus', e.target.value)}/>
        </div>
        <div>
          <label>Mother Status</label>
          <input type="text" value={form.familyDetails.motherStatus} onChange={e => handleNested('familyDetails.motherStatus', e.target.value)}/>
        </div>
        <div>
          <label>Brothers</label>
          <input type="number" min="0" value={form.familyDetails.brothers} onChange={e => handleNested('familyDetails.brothers', Number(e.target.value))}/>
        </div>
        <div>
          <label>Sisters</label>
          <input type="number" min="0" value={form.familyDetails.sisters} onChange={e => handleNested('familyDetails.sisters', Number(e.target.value))}/>
        </div>
        <div>
          <label>Family Type</label>
          <select value={form.familyDetails.familyType} onChange={e => handleNested('familyDetails.familyType', e.target.value)}>
            <option>Nuclear</option>
            <option>Joint</option>
          </select>
        </div>
        <div>
          <label>Family Values</label>
          <input type="text" value={form.familyDetails.familyValues} onChange={e => handleNested('familyDetails.familyValues', e.target.value)}/>
        </div>
        <div>
          <label>Diet</label>
          <select value={form.lifestyle.diet} onChange={e => handleNested('lifestyle.diet', e.target.value)}>
            <option value="">Select</option>
            {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label>Smoking</label>
          <select value={form.lifestyle.smoking} onChange={e => handleNested('lifestyle.smoking', e.target.value)}>
            {YES_NO_OCC.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label>Drinking</label>
          <select value={form.lifestyle.drinking} onChange={e => handleNested('lifestyle.drinking', e.target.value)}>
            {YES_NO_OCC.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <label>Photos (up to 6)</label>
<input type="file" accept="image/*" multiple onChange={onPickPhotos} />
<div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
  {selectedFiles.map((f,i)=>(
    <span key={i} style={{fontSize:12}}>{f.name}</span>
  ))}
</div>

      {/* Partner Preferences */}
    <hr style={{margin: '24px 0'}}/>
<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
  <h2 style={{gridColumn:'1 / -1'}}>Partner Preferences</h2>

  {/* Age & Height */}
  <div>
    <label>Age Range</label>
    <div style={{display:'flex', gap:8}}>
      <input type="number"
        value={form.partnerPreferences.ageRange.min}
        onChange={e => handlePartnerPreferencesChange('partnerPreferences.ageRange.min', Number(e.target.value))}
        placeholder="Min" min="18" />
      <input type="number"
        value={form.partnerPreferences.ageRange.max}
        onChange={e => handlePartnerPreferencesChange('partnerPreferences.ageRange.max', Number(e.target.value))}
        placeholder="Max" min="18" />
    </div>
  </div>

  <div>
    <label>Height Range (cm)</label>
    <div style={{display:'flex', gap:8}}>
      <input type="number"
        value={form.partnerPreferences.heightRange.min}
        onChange={e => handlePartnerPreferencesChange('partnerPreferences.heightRange.min', Number(e.target.value))}
        placeholder="Min" />
      <input type="number"
        value={form.partnerPreferences.heightRange.max}
        onChange={e => handlePartnerPreferencesChange('partnerPreferences.heightRange.max', Number(e.target.value))}
        placeholder="Max" />
    </div>
  </div>

  {/* Marital Status (checkboxes) */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Marital Status</label>
<CheckboxGroup
  options={religions.map(r => ({ label: r.name, value: r._id || r.id }))}
  selected={form.partnerPreferences.religion}
  onToggle={(val) => setForm(prev => ({
    ...prev,
    partnerPreferences: {
      ...prev.partnerPreferences,
      religion: toggleInArray(prev.partnerPreferences.religion, val)
    }
  }))}
/>
  </div>

  {/* Religion (checkboxes) */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Religion</label>
   <CheckboxGroup
  options={ppFilteredCastes.map(c => ({
    label: c.category ? `${c.name} (${c.category})` : c.name,
    value: c._id || c.id
  }))}
  selected={form.partnerPreferences.caste}
  onToggle={(val) => setForm(prev => ({
    ...prev,
    partnerPreferences: {
      ...prev.partnerPreferences,
      caste: toggleInArray(prev.partnerPreferences.caste, val)
    }
  }))}
/>
  </div>

  {/* Caste (checkboxes) */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Caste</label>
   <CheckboxGroup
  options={ppFilteredSubCastes.map(sc => ({
    label: sc.name,
    value: sc._id || sc.id
  }))}
  selected={form.partnerPreferences.subCaste}
  onToggle={(val) => setForm(prev => ({
    ...prev,
    partnerPreferences: {
      ...prev.partnerPreferences,
      subCaste: toggleInArray(prev.partnerPreferences.subCaste, val)
    }
  }))}
/>
  </div>
<div style={{gridColumn:'1 / -1'}}>
  <label style={{fontWeight:600, display:'block', marginBottom:6}}>
    Sub Caste
  </label>
  <CheckboxGroup
    options={(ppSubCastes || []).map(sc => ({ label: sc.name, value: sc._id }))}
    selected={form.partnerPreferences.subCaste}
    onToggle={(val) =>
      setForm(prev => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          subCaste: toggleInArray(prev.partnerPreferences?.subCaste || [], val)
        }
      }))
    }
  />
</div>
  {/* Education */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Education</label>
    <CheckboxGroup
      options={educations.map(ed => ({ label: ed.field ? `${ed.degree} — ${ed.field}` : ed.degree, value: ed._id }))}
      selected={form.partnerPreferences.education}
      onToggle={(val) => setForm(prev => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          education: toggleInArray(prev.partnerPreferences.education, val)
        }
      }))}
    />
  </div>

  {/* Profession */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Profession</label>
    <CheckboxGroup
      options={professions.map(p => ({ label: p.industry ? `${p.occupation} — ${p.industry}` : p.occupation, value: p._id }))}
      selected={form.partnerPreferences.profession}
      onToggle={(val) => setForm(prev => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          profession: toggleInArray(prev.partnerPreferences.profession, val)
        }
      }))}
    />
  </div>

  {/* Location */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Location</label>
    <CheckboxGroup
      options={locations.map(l => ({ label: `${l.city}, ${l.state}`, value: l._id }))}
      selected={form.partnerPreferences.location}
      onToggle={(val) => setForm(prev => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          location: toggleInArray(prev.partnerPreferences.location, val)
        }
      }))}
    />
  </div>

  {/* Diet */}
  <div style={{gridColumn:'1 / -1'}}>
    <label style={{fontWeight:600, display:'block', marginBottom:6}}>Diet</label>
    <CheckboxGroup
      options={DIETS.map(d => ({ label: d, value: d }))}
      selected={form.partnerPreferences.diet}
      onToggle={(val) => setForm(prev => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          diet: toggleInArray(prev.partnerPreferences.diet, val)
        }
      }))}
    />
  </div>
</div>

      <div style={{marginTop:16}}>
        <button type="submit" disabled={!canSubmit || saving}>
          {saving ? 'Saving...' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
