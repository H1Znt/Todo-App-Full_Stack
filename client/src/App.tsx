import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TodosPage from "./pages/TodosPage";
import { useAppSelector } from "./store/hooks";

function App() {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!accessToken && !["/login", "/register"].includes(location.pathname)) {
      navigate("/login");
    }
  }, [accessToken, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#FFE8D6] text-[#6B705C] transition-colors">
      <div className="container mx-auto px-4 py-12">
        <Routes>
          <Route
            path="/login"
            element={!accessToken ? <LoginPage /> : <Navigate to="/todos" />}
          />
          <Route
            path="/register"
            element={!accessToken ? <RegisterPage /> : <Navigate to="/todos" />}
          />
          <Route
            path="/todos"
            element={accessToken ? <TodosPage /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={
              <Navigate to={accessToken ? "/todos" : "/login"} replace />
            }
          />
        </Routes>
      </div>

      <ToastContainer
        position="top-right"
        theme="colored"
        autoClose={1800}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        hideProgressBar
      />
    </div>
  );
}

export default App;
