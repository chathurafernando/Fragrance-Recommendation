import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, onboardingstep } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      console.log("No token, navigating to login");
      navigate('/login', { replace: true });
      return;
    }

    if (!user) {
      console.log("No user found, navigating to login");
      navigate('/login', { replace: true });
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      console.log(`Wrong role, expected ${requiredRole}, found ${user.role}. Redirecting to login.`);
      navigate('/login', { replace: true });
      return;
    }

    const nextRoute = getNextIncompleteRoute(user.role, onboardingstep);
    if (nextRoute !== null) {
      console.log(`User not fully onboarded. Redirecting to: ${nextRoute}`);
      navigate(nextRoute, { replace: true });
      return;
    }

    setChecking(false);
  }, [token, user, requiredRole, navigate]);

  return children;
};


function getNextIncompleteRoute(role, onboardingstep) {

  console.log(role, onboardingstep);
  
if (role === 'vendor') {
  const onboardingPath = '/vendor/register-business';
  const isOnboardingPath = window.location.pathname === onboardingPath;
  const vendorPaths = [
    '/vendor/register-business',
    '/vendor/dashboard',
    '/vendor/add-products',
    '/vendor/products',
    '/vendor/advertisements',
    '/vendor/payment',
    '/vendor/displayAdvertisements',
    '/write',
  ];

  if (onboardingstep < 6) {
    // Block access to vendor paths except onboarding path
    if (!isOnboardingPath && vendorPaths.includes(window.location.pathname)) {
      return onboardingPath;
    }
  } else {
    // Block access to onboarding path once completed
    if (isOnboardingPath) {
      return '/vendor/dashboard';
    }
  }

  return null;
}

if (role === 'user') {
  // List of onboarding-exclusive paths (blocked after completion)
  const onboardingPaths = [
    '/user/your-favourite-notes',
    '/user/personal-preferences',
  ];

  // If onboarding is INCOMPLETE (step < 3)
  if (onboardingstep < 3) {
    // Redirect to current onboarding step if trying to access non-onboarding paths
    if (!onboardingPaths.includes(window.location.pathname)) {
      return onboardingstep === 1 
        ? '/user/your-favourite-notes' 
        : '/user/personal-preferences';
    }
  }
  // If onboarding is COMPLETE (step >= 3)
  else {
    // Block access to onboarding paths (redirect to Dashboard)
    if (onboardingPaths.includes(window.location.pathname)) {
      return '/user/Dashboard';
    }
  }

  // Allow access to all other paths
  return null;
}

  if (role === 'admin') {
    return null; // admin can directly go to dashboard
  }

  return '/login'; // fallback
}

export default ProtectedRoute;
