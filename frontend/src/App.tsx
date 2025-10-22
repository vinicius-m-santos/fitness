import { Routes, Route } from "react-router-dom";
import Anamnese from "./pages/Anamnese";
import ClientView from "./pages/ClientView";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import PrivateRoute from "./utils/Auth/PrivateRoute";
import AdminLayout from "./layout/AdminLayout";
import Home from "./pages/Home";
import UuidRoute from "./utils/Auth/UuidRoute";
import NoAuthLayout from "./layout/NoAuthLayout";
import Clients from "./pages/Clients";
import Exercise from "./pages/Exercise";

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
                path="/anamnese"
                element={
                    <UuidRoute>
                        <NoAuthLayout>
                            <Anamnese />
                        </NoAuthLayout>
                    </UuidRoute>
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
                path="/exercises"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <Exercise />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}
