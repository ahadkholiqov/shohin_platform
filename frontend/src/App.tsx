import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import CatalogPage from './pages/CatalogPage'
import ChessboardPage from './pages/ChessboardPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/chessboard" element={<ChessboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
