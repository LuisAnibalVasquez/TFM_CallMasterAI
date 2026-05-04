import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Call Master AI</h1>
      <p>The ultimate SaaS for AI Campaign Management.</p>
      <Link to="/login">
        <button
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Log In
        </button>
      </Link>
    </div>
  );
};

const LoginPage = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Log In</h2>
      <p>Authentication form will go here.</p>
      <Link to="/">← Back to Home</Link>
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
