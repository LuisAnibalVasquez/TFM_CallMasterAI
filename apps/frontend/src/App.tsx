import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LandingPage } from "./features/landing/pages/LandingPage";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="glass-panel p-12 rounded-3xl ai-glow-border glow-bloom text-center max-w-md w-full mx-auto">
        <h2 className="font-h2 text-h2 text-white mb-4">Log In</h2>
        <p className="font-body-md text-on-surface-variant mb-8">
          Authentication form will go here.
        </p>
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
