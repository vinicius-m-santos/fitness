import { Routes, Route } from "react-router-dom";
import ClientView from "./pages/ClientView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import PrivateRoute from "./utils/Auth/PrivateRoute";
import AdminLayout from "./layout/AdminLayout";
import Home from "./pages/Home";
import NoAuthLayout from "./layout/NoAuthLayout";
import Clients from "./pages/Clients";
import Exercise from "./pages/Exercise";
import ProfilePage from "./pages/ProfilePage";
import EmailVerification from "./pages/EmailVerification";
import RegisterSuccess from "./pages/RegisterSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientRegister from "./pages/ClientRegister";

export default function App() {
    return (
        <Routes>
            <Route
                path="/clients"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <Clients />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/client-view/:id"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <ClientView />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/"
                element={
                    <NoAuthLayout>
                        <Home />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/login"
                element={
                    <NoAuthLayout>
                        <Login />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/register"
                element={
                    <NoAuthLayout>
                        <Register />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/register-success"
                element={
                    <NoAuthLayout>
                        <RegisterSuccess />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/verify-email/:token"
                element={
                    <NoAuthLayout>
                        <EmailVerification />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/email-not-verified"
                element={
                    <NoAuthLayout>
                        <EmailVerification />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <NoAuthLayout>
                        <ForgotPassword />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/reset-password/:token"
                element={
                    <NoAuthLayout>
                        <ResetPassword />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/client-register/:token/:clientUuid"
                element={
                    <NoAuthLayout>
                        <ClientRegister />
                    </NoAuthLayout>
                }
            />
            <Route
                path="/exercises"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <Exercise />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <ProfilePage />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}
