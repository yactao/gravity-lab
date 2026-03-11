import './App.css'
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from './pages/signin/SignInPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Chat from './pages/Chat/Chat';



function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Sign-in page is accessible to everyone */}
        <Route path="/sign-in" element={<SignInPage />} />

        {/* Protected Routes: Wrap Home and ChatPage */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:moduleName"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown route to sign-in or home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

