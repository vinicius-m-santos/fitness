import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import WelcomeModal from "./WelcomeModal";

const STORAGE_KEY_PREFIX = "fitness_hasSeenWelcome_";

export default function WelcomeModalGate() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user?.id || !user?.roles?.includes("ROLE_PERSONAL")) return;
        const key = `${STORAGE_KEY_PREFIX}${user.id}`;
        if (localStorage.getItem(key) !== "true") setIsOpen(true);
    }, [user?.id, user?.roles]);

    const handleClose = () => {
        if (user?.id) {
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, "true");
        }
        setIsOpen(false);
    };

    if (!user?.roles?.includes("ROLE_PERSONAL")) return null;

    return <WelcomeModal open={isOpen} onClose={handleClose} />;
}
