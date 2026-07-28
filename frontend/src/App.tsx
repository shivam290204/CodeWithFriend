import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import ComingSoon from './pages/ComingSoon';
import Docs from './pages/Docs';
import { ReactLenis } from 'lenis/react';

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/marketplace" element={<ComingSoon />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/pricing" element={<ComingSoon />} />

          {/* Fallback route to prevent blank screens on dead links */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ReactLenis>
  );
}

export default App;
