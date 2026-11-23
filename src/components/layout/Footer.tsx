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

const toolLinks = [{ href: "https://ozhivu.vemmully.in/", label: "Ozhivu" }];

const heading = "mb-4 font-heading text-sm font-bold uppercase tracking-[0.2em] text-text-secondary";
const link =
  "text-base font-semibold text-text underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-accent";

const Footer = () => (
  <footer className="flex flex-col overflow-hidden border-t border-border bg-bg lg:min-h-[60dvh]">
    <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-start gap-x-20 gap-y-10 px-6 pt-14 pb-8">
      <nav aria-label="Explore">
        <h3 className={heading}>Explore</h3>
        <ul className="space-y-4">
          {exploreLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={link}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Tools">
        <h3 className={heading}>Tools</h3>
        <ul className="space-y-4">
          {toolLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>{l.label}</a>
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
              <Icon size={22} />
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* Decorative wordmark: bottom-right, cropped so ~4/5 of the lettering shows */}
    <div className="mx-auto mt-auto flex w-full max-w-6xl justify-end px-6" aria-hidden="true">
      <div className="h-[0.64em] select-none overflow-hidden text-[clamp(3.5rem,11.5vw,11.5rem)]">
        <span className="block font-heading font-black uppercase leading-[0.75] tracking-tighter text-text/10">
          ANANAAS
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
