import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './routes/Landing'
import Home from './routes/Home'
import Browse from './routes/Browse'
import Search from './routes/Search'
import Saved from './routes/Saved'
import Pantry from './routes/Pantry'
import TestFooter from './components/TestFooter'

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/search" element={<Search />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/pantry" element={<Pantry />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <TestFooter />
    </>
  )
}
