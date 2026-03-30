"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaDove } from "react-icons/fa";
import { Sparkles } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#f8fbff] relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-orange-50/30" />

      <motion.div
        className="absolute -top-32 inset-x-0 h-[70vh] bg-gradient-to-b from-orange-100/50 to-transparent blur-3xl rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />

      <div
        className="absolute top-1/4 -left-20 w-80 h-80 bg-white/60 rounded-full blur-3xl mix-blend-overlay animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl mix-blend-overlay animate-pulse"
        style={{ animationDuration: "6s" }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto mt-[-5vh]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
      >
        <div className="relative mb-14 w-32 h-32 flex items-center justify-center mt-8">
          <motion.div
            className="absolute inset-0 bg-orange-200/40 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            initial={{ y: 15 }}
            animate={{ y: -5 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="relative z-10 text-primary"
          >
            <FaDove className="w-16 h-16 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute top-0 right-2 text-orange-300"
            animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-0 text-orange-400"
            animate={{ rotate: -360, scale: [1, 0.7, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>

        <motion.h1
          className="text-3xl sm:text-4xl font-serif text-slate-800 mb-6 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Your gift has reached your fellow.
        </motion.h1>

        <motion.p
          className="text-slate-500 mb-10 leading-relaxed font-light text-[15px] max-w-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          Thank you for your beautiful heart. Your generosity is a fragrant
          offering, a sacrifice acceptable and pleasing to God.
        </motion.p>

        <motion.div
          className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm rounded-2xl p-6 relative overflow-hidden mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 1.5,
            type: "spring",
            stiffness: 100,
          }}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-300 to-primary" />
          <p className="text-slate-700 font-serif italic text-lg leading-relaxed mb-3">
            "God loves a cheerful giver."
          </p>
          <p className="text-primary/80 font-medium text-[11px] tracking-[0.2em] uppercase">
            — 2 Corinthians 9:7
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white text-[13px] font-medium tracking-wide rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
