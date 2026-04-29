import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const socialLinks = [
  { href: "https://github.com/anasvemmully", icon: FaGithub, label: "GitHub" },
  { href: "https://www.linkedin.com/in/muhammed-anas-536a7b201/", icon: FaLinkedin, label: "LinkedIn" },
  { href: "mailto:anas@vemmully.in", icon: HiOutlineMail, label: "Email" },
];

const Footer = () => {

  return (
    <footer className="py-12 mt-20 border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <h3 className="font-heading text-lg font-bold">Connect</h3>
        <div className="flex gap-4">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border-2 border-text bg-bg-alt text-text hover:bg-accent hover:text-black transition-all shadow-[2px_2px_0_var(--color-primary-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--color-primary-black)]"
                aria-label={social.label}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
        <Link 
          href="/works" 
          className="mt-2 text-xs font-black uppercase tracking-widest border-b-2 border-text hover:text-accent hover:border-accent transition-all"
        >
          my works &rarr;
        </Link>
        </div>
        
        <div className="text-sm font-bold text-text-secondary md:mt-10 uppercase tracking-widest text-center md:text-right">
          &copy; {new Date().getFullYear()} Anas.<br className="hidden md:block" /> Made with ❤︎⁠
        </div>
      </div>
    </footer>
  );
};

export default Footer;
