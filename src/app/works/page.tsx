import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Works | Anas",
  description: "A showcase of my recent projects and professional work.",
};

export default function WorksPage() {
  const works = [
    {
      title: "AYA Enterprises",
      description: "Trusted exporters of high-quality cardamom.",
      url: "https://www.ayaenterprises.in/",
      tags: ["Business", "Corporate", "Web Design"],
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-16">
        <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-text mb-4">
          WORKS
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {works.map((work) => (
          <div 
            key={work.title}
            className="group relative bg-surface border-4 border-text p-8 shadow-[8px_8px_0_var(--color-primary-black)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-primary-black)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-heading font-black tracking-tight">{work.title}</h2>
                <Link 
                  href={work.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-text hover:bg-accent transition-colors"
                >
                  <ExternalLink size={20} />
                </Link>
              </div>
              <p className="text-text-secondary mb-6 font-medium leading-relaxed">
                {work.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {work.tags.map(tag => (
                  <span key={tag} className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-text text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <Link 
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
            >
              Visit Project <span>&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
