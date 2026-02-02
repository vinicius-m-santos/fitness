import { Routes, Route } from "react-router-dom";
import ClientView from "./pages/ClientView";
import StudentHome from "./pages/StudentHome";
import StudentWorkouts from "./pages/StudentWorkouts";
import StudentExerciseSession from "./pages/StudentExerciseSession";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import PrivateRoute, {
    ROLE_CLIENT,
    ROLE_PERSONAL,
} from "./utils/Auth/PrivateRoute";
import ClientViewGuard from "./utils/Auth/ClientViewGuard";
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
import StandardTrainings from "./pages/StandardTrainings";
import WeekSummary from "./pages/WeekSummary";
import PlanSubscription from "./pages/PlanSubscription";

export default function App() {
    return (
        <Routes>
            <Route
                path="/week-summary"
                element={
                    <PrivateRoute allowedRoles={[ROLE_PERSONAL]}>
                        <AdminLayout>
                            <WeekSummary />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/clients"
                element={
                    <PrivateRoute allowedRoles={[ROLE_PERSONAL]}>
                        <AdminLayout>
                            <Clients />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/client-view/:id"
                element={
                    <PrivateRoute
                        allowedRoles={[ROLE_PERSONAL, ROLE_CLIENT]}
                    >
                        <ClientViewGuard>
                            <AdminLayout>
                                <ClientView />
                            </AdminLayout>
                        </ClientViewGuard>
                    </PrivateRoute>
                }
            />
            <Route
                path="/student"
                element={
                    <PrivateRoute allowedRoles={[ROLE_CLIENT]}>
                        <AdminLayout>
                            <StudentHome />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/student/workouts"
                element={
                    <PrivateRoute allowedRoles={[ROLE_CLIENT]}>
                        <AdminLayout>
                            <StudentWorkouts />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/student/training/:trainingId/period/:periodId/execute"
                element={
                    <PrivateRoute allowedRoles={[ROLE_CLIENT]}>
                        <AdminLayout>
                            <StudentExerciseSession />
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
                    <PrivateRoute allowedRoles={[ROLE_PERSONAL]}>
                        <AdminLayout>
                            <Exercise />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/standard-trainings"
                element={
                    <PrivateRoute allowedRoles={[ROLE_PERSONAL]}>
                        <AdminLayout>
                            <StandardTrainings />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute
                        allowedRoles={[ROLE_CLIENT, ROLE_PERSONAL]}
                    >
                        <AdminLayout>
                            <ProfilePage />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/plan"
                element={
                    <PrivateRoute allowedRoles={[ROLE_PERSONAL]}>
                        <AdminLayout>
                            <PlanSubscription />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}
