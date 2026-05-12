import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import VolunteerLogin from './pages/VolunteerLogin'
import VolunteerRegister from './pages/VolunteerRegister'
import VolunteerDashboard from './pages/VolunteerDashboard'
import BookingManagement from './pages/BookingManagement'
import ClientServices from './pages/ClientServices'
import Store from './pages/Store'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/volunteer/login" replace />
}

const AppRoutes: React.FC = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/client-services" element={<ClientServices />} />
      <Route path="/store" element={<Store />} />
      <Route path="/volunteer/login" element={<VolunteerLogin />} />
      <Route path="/volunteer/register" element={<VolunteerRegister />} />
      <Route path="/volunteer/dashboard" element={<ProtectedRoute><VolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
)

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App

