import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import CatalogPage from './pages/CatalogPage'
import ChessboardPage from './pages/ChessboardPage'
import RequireAdmin from './components/admin/RequireAdmin'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminApartmentsPage from './pages/admin/AdminApartmentsPage'
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage'
import AdminGalleryPage from './pages/admin/AdminGalleryPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/chessboard" element={<ChessboardPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminApartmentsPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
