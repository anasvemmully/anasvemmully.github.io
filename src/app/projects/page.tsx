import { Manrope, Roboto } from "next/font/google";
import PageContainer from "@/components/layout/PageContainer";
import ProjectCard, { type Project } from "@/components/ProjectCard";

const INTRO = "Products I've built. Both are live, so you can try them yourself.";

export const metadata = {
  title: "Projects",
  description:
    "Products built by Anas, including Ozhivu, a timeline planner, and ComRaid, a service for sending app notifications.",
};

/*
 * Each card's title is set in the font of the site it shows. They're loaded
 * here, so they only ship with this page. Descriptions use this site's font.
 */
const roboto = Roboto({ subsets: ["latin"], weight: "700" });
const manrope = Manrope({ subsets: ["latin"], weight: "700" });

const projects: Project[] = [
  {
    title: "Ozhivu",
    description:
      "A planning tool for scheduling work. You lay out each team's jobs on one timeline that you can zoom in and out of, and it points out any jobs that clash. When the plan is ready, you share it as a link. Nothing you enter is stored anywhere, so your plan stays private.",
    url: "https://ozhivu.vemmully.in/",
    logo: { src: "/images/projects/ozhivu.svg", width: 32, height: 32 },
    panel: "#f9fbfd",
    titleFont: `${roboto.className} text-2xl font-bold`,
  },
  {
    title: "ComRaid",
    description:
      "A service that lets businesses send notifications to their customers' phones, on both Android and iPhone. A team picks who to reach, writes the message, sends it right away or schedules it for later, and then sees how many people received and opened it. Businesses start for free and pay according to how many people they message each month.",
    url: "https://comraid.io/",
    logo: { src: "/images/projects/comraid.png", width: 414, height: 414 },
    panel: "#1d1d1a",
    titleFont: `${manrope.className} text-2xl font-bold`,
  },
];

export default function ProjectsPage() {
  return (
    <PageContainer>
      <header className="mb-12 md:mb-16">
        <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tighter text-text md:text-7xl">
          Projects
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium text-text-secondary md:text-lg">
          {INTRO}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </ul>
    </PageContainer>
  );
}
