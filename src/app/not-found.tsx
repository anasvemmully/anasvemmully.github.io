"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center relative overflow-hidden">
      {/* Background Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-32 h-32 bg-accent opacity-20 -z-10"
      />
      <motion.div
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-48 h-48 border-4 border-text opacity-10 -z-10 rounded-full"
      />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <h1 className="text-[10rem] md:text-[15rem] font-heading font-black tracking-tighter leading-none text-text">
            404
          </h1>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-accent p-4 border-4 border-text shadow-[8px_8px_0_var(--color-primary-black)]"
          >
            <AlertCircle size={48} className="text-text" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-6 uppercase">
          Lost in Space?
        </h2>
        <p className="text-xl text-text-secondary font-medium max-w-md mx-auto mb-10">
          The page you&apos;re looking for has drifted into the void. Let&apos;s get you back to safety.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-accent border-4 border-text text-xl font-black uppercase tracking-widest shadow-[8px_8px_0_var(--color-primary-black)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-primary-black)] transition-all"
        >
          <Home size={24} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
