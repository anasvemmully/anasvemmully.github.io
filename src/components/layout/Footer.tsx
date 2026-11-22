import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const socialLinks = [
  { href: "https://github.com/anasvemmully", icon: FaGithub, label: "GitHub" },
  { href: "https://www.linkedin.com/in/muhammed-anas-536a7b201/", icon: FaLinkedin, label: "LinkedIn" },
  { href: "mailto:anas@vemmully.in", icon: HiOutlineMail, label: "Email" },
];

const exploreLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/works", label: "My works" },
];

const toolLinks = [{ href: "/timeline", label: "Window timeline" }];

const heading = "mb-4 font-heading text-xs font-bold uppercase tracking-[0.2em] text-text-secondary";
const link =
  "text-sm font-semibold text-text underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-accent";

const Footer = () => (
  <footer className="border-t border-border bg-bg">
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
      <div className="max-w-xs">
        <Link href="/" className="font-heading text-2xl font-black tracking-tighter text-text">
          ANAS
        </Link>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          A developer passionate about exploring new tech and honing skills.
        </p>
      </div>

      <nav aria-label="Explore">
        <h3 className={heading}>Explore</h3>
        <ul className="space-y-3">
          {exploreLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={link}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Tools">
        <h3 className={heading}>Tools</h3>
        <ul className="space-y-3">
          {toolLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={link}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <h3 className={heading}>Connect</h3>
        <div className="flex gap-3">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="border-2 border-text bg-bg-alt p-2 text-text shadow-[2px_2px_0_var(--color-primary-black)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-accent hover:text-black hover:shadow-[1px_1px_0_var(--color-primary-black)]"
            >
              <Icon size={18} />
            </Link>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-border/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs font-bold uppercase tracking-widest text-text-secondary sm:flex-row">
        <span>&copy; {new Date().getFullYear()} Anas</span>
        <span>Made with ❤︎</span>
      </div>
    </div>
  </footer>
);

export default Footer;
