import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/apiService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { user: userData, profile, token } = response;
      
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      if (profile) {
        localStorage.setItem("userProfile", JSON.stringify(profile));
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData, profile };
    } catch (error) {

      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
