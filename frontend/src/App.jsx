import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import CreatePaste from './pages/dashboard/CreatePaste.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import EditPaste from './pages/dashboard/EditPaste.jsx'
import ViewPaste from './pages/dashboard/ViewPaste.jsx'
import NotFound from './pages/NotFound.jsx'
import PublicPaste from './pages/PublicPaste.jsx'

function protectedPage(page) {
  return <ProtectedRoute><DashboardLayout>{page}</DashboardLayout></ProtectedRoute>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/pastes/my" element={protectedPage(<Dashboard />)} />
        <Route path="/pastes/new" element={protectedPage(<CreatePaste />)} />
        <Route path="/pastes/:publicId" element={protectedPage(<ViewPaste />)} />
        <Route path="/pastes/:publicId/edit" element={protectedPage(<EditPaste />)} />
        <Route path="/share/:publicId" element={<PublicPaste />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
