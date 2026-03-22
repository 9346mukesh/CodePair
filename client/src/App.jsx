import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Lobby from './pages/Lobby.jsx'
import Session from './pages/Session.jsx'
import Results from './pages/Results.jsx'
import ProblemsLibrary from './pages/ProblemsLibrary.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg text-text-primary font-ui">
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/library" element={<ProblemsLibrary />} />
        <Route path="/join" element={<Join />} />
        <Route path="/join/:roomCode" element={<Join />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/session/:roomCode" element={<Session />} />
        <Route path="/results/:sessionId" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
