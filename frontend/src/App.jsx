import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

// A protected route wrapper for any authenticated user
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// A highly restricted route wrapper only for System Administrators
const AdminRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin' && user.identifier !== 'hedportal16@gmail.com') {
    return <Navigate to="/user-dashboard" replace />; // Fallback to safe area
  }
  return children;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check local storage for persistent user state (containing identifier and role)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('hed_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Whenever user object changes, sync to localStorage to persist across reloads
  useEffect(() => {
    if (user) {
      localStorage.setItem('hed_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hed_user');
    }
  }, [user]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      if (user && user.identifier) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.identifier })
        });
      }
    } catch (error) {
      console.error("Failed to call logout endpoint:", error);
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={(user.role === 'admin' || user.identifier === 'hedportal16@gmail.com') ? "/admin-dashboard" : "/user-dashboard"} replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />

        {/* Protected User Dashboard Route */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute user={user}>
              <UserDashboard user={user} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Dashboard Route */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute user={user}>
              <AdminDashboard user={user} handleLogout={handleLogout} />
            </AdminRoute>
          }
        />

        {/* Intercept old /dashboard routes seamlessly */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate to={(user.role === 'admin' || user.identifier === 'hedportal16@gmail.com') ? "/admin-dashboard" : "/user-dashboard"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to={user ? ((user.role === 'admin' || user.identifier === 'hedportal16@gmail.com') ? "/admin-dashboard" : "/user-dashboard") : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
