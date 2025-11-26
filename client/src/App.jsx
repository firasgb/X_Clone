import HomePage from "./pages/auth/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import { Routes, Route, Navigate } from "react-router-dom";
import SideBar from "./components/common/SideBar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/auth/notification/NotificationPage";
import ProfilePage from "./pages/auth/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const {
    data: authUser,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["authUser"], //we use queryKey to give a unique name to query and refer to it later in any file
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null; //even if user is not authenticated data is returned as a empty object so we make null in error case
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch user");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Failed to fetch user");
      }
    },
    retry: false, // by default 4 request sended => when false 1 request send
  });
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <SideBar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:id"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
