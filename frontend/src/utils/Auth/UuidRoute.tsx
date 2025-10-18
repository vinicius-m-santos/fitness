import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/ui/loader";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function UuidRoute({ children }) {
    const query = useQuery();
    const token = query.get("token");

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    useEffect(() => {
        if (!token) {
            setValid(false);
            setLoading(false);
            return;
        }

        axios
            .get(`${import.meta.env.VITE_API_URL}/user/check-token/${token}`)
            .then((res) => {
                if (res.data?.status) {
                    setValid(true);
                } else {
                    setValid(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setValid(false);
            })
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return <Loader loading={loading} />;
    }

    if (!valid) return <Navigate to="/" replace />;

    return <>{children}</>;
}
