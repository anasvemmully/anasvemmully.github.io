"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { href: "/projects", label: "Projects", icon: LayoutGrid },
    { href: "/blog", label: "Blog", icon: Book },
  ];

  return (
    <header className="w-full border-b-1">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-heading font-black tracking-tighter text-text flex items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.span layout transition={{ type: "spring", stiffness: 400, damping: 30 }}>A</motion.span>
          
          <motion.span 
            layout 
            animate={{ color: isHovered ? "var(--color-accent)" : "var(--color-text)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            N
          </motion.span>

          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ width: 0, opacity: 0, scale: 0.5 }}
                animate={{ width: "auto", opacity: 1, scale: 1 }}
                exit={{ width: 0, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="text-accent overflow-hidden whitespace-nowrap"
              >
                ANA
              </motion.span>
            )}
          </AnimatePresence>

          <motion.span 
            layout 
            animate={{ color: isHovered ? "var(--color-accent)" : "var(--color-text)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            A
          </motion.span>

          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ width: 0, opacity: 0, scale: 0.5 }}
                animate={{ width: "auto", opacity: 1, scale: 1 }}
                exit={{ width: 0, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="text-accent overflow-hidden whitespace-nowrap"
              >
                A
              </motion.span>
            )}
          </AnimatePresence>

          <motion.span layout transition={{ type: "spring", stiffness: 400, damping: 30 }}>S</motion.span>
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                      isActive
                        ? "text-text border-b-2 border-accent pb-1"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
