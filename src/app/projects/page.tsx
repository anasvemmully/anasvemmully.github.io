import Image from "next/image";

export const metadata = {
  title: "Projects | Anas",
  description: "Exciting projects coming soon.",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-10 border-4 border-text shadow-[8px_8px_0_var(--color-primary-black)] bg-white overflow-hidden">
          <Image 
            src="/images/thinking.gif" 
            alt="Thinking" 
            fill 
            className="object-cover"
            unoptimized
          />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-text mb-6 uppercase">
          PROJECTS
        </h1>
        
        <div className="inline-block bg-accent px-4 py-2 border-2 border-text shadow-[4px_4px_0_var(--color-primary-black)]">
          <p className="text-xl font-black text-text uppercase tracking-widest animate-pulse">
            in progress thinking...
          </p>
        </div>
      </div>
    </div>
  );
}
