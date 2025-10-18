import { Routes, Route } from "react-router-dom";
import Anamnese from "./pages/Anamnese";
import ClientView from "./pages/ClientView";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import PrivateRoute from "./utils/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layout/AdminLayout";

export default function App() {
    return (
        <Routes>
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    </PrivateRoute>
                }
            />
            <Route path="/anamnese" element={<Anamnese />} />
            <Route path="/client-view/:id" element={<ClientView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}
