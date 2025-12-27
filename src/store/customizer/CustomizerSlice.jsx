import { createSlice } from '@reduxjs/toolkit';

// Retrieve stored theme settings from localStorage or set defaults
const initialState = {
  activeDir: localStorage.getItem('activeDir') || 'ltr',
  activeMode: localStorage.getItem('activeMode') || 'light', // 'light' or 'dark'
  activeTheme: localStorage.getItem('activeTheme') || 'BLUE_THEME', 
  SidebarWidth: 270,
  MiniSidebarWidth: 87,
  TopbarHeight: 70,
  isLayout: localStorage.getItem('isLayout') || 'boxed', // 'full' or 'boxed'
  isCollapse: JSON.parse(localStorage.getItem('isCollapse')) || false,
  isSidebarHover: false,
  isMobileSidebar: false,
  isHorizontal: JSON.parse(localStorage.getItem('isHorizontal')) || false,
  isLanguage: localStorage.getItem('isLanguage') || 'en',
  isCardShadow: JSON.parse(localStorage.getItem('isCardShadow')) || true,
  borderRadius: parseInt(localStorage.getItem('borderRadius'), 10) || 7,
};

export const CustomizerSlice = createSlice({
  name: 'customizer',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.activeTheme = action.payload;
      localStorage.setItem('activeTheme', action.payload);
    },
    setDarkMode: (state, action) => {
      state.activeMode = action.payload;
      localStorage.setItem('activeMode', action.payload);
    },
    setDir: (state, action) => {
      state.activeDir = action.payload;
      localStorage.setItem('activeDir', action.payload);
    },
    setLanguage: (state, action) => {
      state.isLanguage = action.payload;
      localStorage.setItem('isLanguage', action.payload);
    },
    setCardShadow: (state, action) => {
      state.isCardShadow = action.payload;
      localStorage.setItem('isCardShadow', action.payload);
    },
    toggleSidebar: (state) => {
      state.isCollapse = !state.isCollapse;
      localStorage.setItem('isCollapse', state.isCollapse);
    },
    hoverSidebar: (state, action) => {
      state.isSidebarHover = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebar = !state.isMobileSidebar;
    },
    toggleLayout: (state, action) => {
      state.isLayout = action.payload;
      localStorage.setItem('isLayout', action.payload);
    },
    toggleHorizontal: (state, action) => {
      state.isHorizontal = action.payload;
      localStorage.setItem('isHorizontal', action.payload);
    },
    setBorderRadius: (state, action) => {
      state.borderRadius = action.payload;
      localStorage.setItem('borderRadius', action.payload);
    },
  },
});

export const {
  setTheme,
  setDarkMode,
  setDir,
  toggleSidebar,
  hoverSidebar,
  toggleMobileSidebar,
  toggleLayout,
  setBorderRadius,
  toggleHorizontal,
  setLanguage,
  setCardShadow,
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
