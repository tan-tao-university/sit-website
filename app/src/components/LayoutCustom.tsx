"use client"

import { motion, MotionConfig } from "framer-motion";
import Footer from "./Footer";
import Header from "./Header";
import PopupBannerModal from "./PopupBannerModal";


export default function LayoutCustom({ children }: { children: React.ReactNode }) {
    return (
        // reducedMotion="user" makes every framer-motion animation in the tree (whileInView
        // reveals included) honor prefers-reduced-motion by snapping straight to its end state
        <MotionConfig reducedMotion="user">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="min-h-screen bg-background"
            >
                <Header />
                <PopupBannerModal />
                {children}
                <Footer/>
            </motion.div>
        </MotionConfig>
    );
}
