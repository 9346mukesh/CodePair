import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Lobby from './pages/Lobby.jsx'
import Session from './pages/Session.jsx'
import Results from './pages/Results.jsx'
import ProblemsLibrary from './pages/ProblemsLibrary.jsx'
import DesktopBanner from './components/DesktopBanner.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'

export default function App() {
  return (
    <AuthProvider>
      <DesktopBanner />
      <div className="min-h-screen bg-bg text-text-primary font-ui">
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/library" element={<ProblemsLibrary />} />
        <Route path="/join" element={<Join />} />
        <Route path="/join/:roomCode" element={<Join />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/session/:roomCode" element={<Session />} />
        <Route path="/results/:sessionId" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
