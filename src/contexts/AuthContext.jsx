import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null); // Renamed from 'token' to 'authToken' for consistency
  const [loading, setLoading] = useState(true); // To check initial token from localStorage

  // Load authToken and user from localStorage on initial load
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Use 'authToken' as the consistent key for localStorage
        const storedAuthToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedAuthToken && storedUser) {
          setAuthToken(storedAuthToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load auth data from localStorage", error);
        // Clear corrupted data if any
        localStorage.removeItem('authToken'); // Use consistent key
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadAuthData();
  }, []); // Empty dependency array means this runs once on mount

  // Save authToken and user to localStorage whenever they change
  useEffect(() => {
    if (authToken && user) {
      localStorage.setItem('authToken', authToken); // Use consistent key
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [authToken, user, loading]); // Depend on authToken, user, and loading

  const login = (jwtToken, userData) => {
    setAuthToken(jwtToken); // Update authToken state
    setUser(userData);
  };

  const logout = () => {
    setAuthToken(null); // Clear authToken state
    setUser(null);
    // The useEffect above will handle clearing localStorage
  };

  // Check if the user is an admin
  const isAdmin = user && user.role === 'admin';

  const value = {
    user,
    authToken, // Provide authToken in the context value
    isAdmin,
    loading,
    login,
    logout,
  };

  // Render the provider with the context value
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

