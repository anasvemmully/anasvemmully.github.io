"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, 
  Lightbulb, 
  Cpu, 
  Palette, 
  Zap, 
  Rocket, 
  Brain, 
  Terminal,
  Blocks,
  Globe
} from "lucide-react";

const ICONS = [Code, Lightbulb, Cpu, Palette, Zap, Rocket, Brain, Terminal, Blocks, Globe];

const FloatingIcon = ({ id, onComplete }: { id: number; onComplete: (id: number) => void }) => {
  const [Icon] = useState(() => ICONS[Math.floor(Math.random() * ICONS.length)]);
  const [x] = useState(() => Math.random() * 200 - 100);

  return (
    <motion.div
      initial={{ y: 150, x: x, opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{ 
        y: -300, 
        x: x + (Math.random() * 80 - 40), 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1, 0.8],
        rotate: Math.random() * 90 - 45
      }}
      transition={{ duration: 5, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(id)}
      className="absolute text-accent pointer-events-none z-20"
    >
      <Icon size={32} strokeWidth={2.5} />
    </motion.div>
  );
};

const IconCloud = () => {
  const [items, setItems] = useState<{ id: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [...prev, { id: Date.now() }]);
    }, 1200); // Spawn an icon every 1.2s
    return () => clearInterval(interval);
  }, []);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="absolute inset-0 flex justify-center items-end pointer-events-none overflow-visible">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <FloatingIcon key={item.id} id={item.id} onComplete={removeItem} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex flex-col text-center md:text-left order-2 md:order-1">
          <h1 className="text-5xl md:text-[5.5rem] font-heading font-black tracking-tighter leading-[1.05] text-text">
            Hello, my<br />
            name&apos;s Anas.<br />
            I&apos;m always <br />
            Learning.
          </h1>
        </div>

        <div className="relative shrink-0 order-1 md:order-2">
          <div className="relative w-64 h-64 md:w-96 md:h-96 animate-morph overflow-hidden border-8 border-text shadow-[12px_12px_0_var(--color-primary-black)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[8px_8px_0_var(--color-primary-black)] transition-all bg-white z-10">
            <Image
              src="/images/avatar.png"
              alt="Anas"
              fill
              sizes="(max-width: 768px) 256px, 384px"
              className="object-cover scale-110"
              priority
            />
          </div>
          
          {/* Floating Icon Layer (Spawning from bottom) */}
          <IconCloud />
        </div>
      </div>
    </div>
  );
}
