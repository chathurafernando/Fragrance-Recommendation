import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [onboardingstep, setOnboardingStepState] = useState(localStorage.getItem('onboardingstep') || 0);
  const [loading, setLoading] = useState(true);

  const setOnboardingStep = (step) => {
    setOnboardingStepState(step);
    localStorage.setItem('onboardingstep', step);
  };

  const login = (userDetails, token) => {
    setUser(userDetails);
    setToken(token);
    setOnboardingStep(userDetails.onboardingstep); // <- This now updates both state + localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userDetails));
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setOnboardingStep(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('onboardingstep');

      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedOnboardingStep = localStorage.getItem('onboardingstep');

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setOnboardingStepState(storedOnboardingStep || 0);
    }
    setLoading(false);
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, onboardingstep, login, logout, setOnboardingStep }}>
      {children}
    </AuthContext.Provider>
  );
};
