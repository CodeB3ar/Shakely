import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './routes/Landing'
import Home from './routes/Home'
import Explore from './routes/Explore'
import Browse from './routes/Browse'
import Saved from './routes/Saved'
import Pantry from './routes/Pantry'
import Recipe from './routes/Recipe'
import Profile from './routes/Profile'
import TestFooter from './components/TestFooter'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {import.meta.env.DEV ? <TestFooter /> : null}
    </>
  )
}
