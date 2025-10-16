import { motion } from "framer-motion";

const ButtonLoader = () => {
    return (
        <motion.div
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
            }}
        />
    );
};

export default ButtonLoader;
