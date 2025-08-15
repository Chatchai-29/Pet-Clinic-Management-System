import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import PetPage from './pages/PetPage';
import OwnerPage from './pages/OwnerPage';
import AppointmentPage from './pages/AppointmentPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
   <Router>
  <Navbar />
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/pets" element={<PetPage />} />
    <Route path="/owners" element={<OwnerPage />} />
    <Route path="/appointments" element={<AppointmentPage />} />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
  </Routes>
</Router>
  );
}

export default App;
