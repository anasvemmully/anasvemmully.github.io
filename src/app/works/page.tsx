import { Bebas_Neue, Outfit, Poppins, Yeseva_One } from "next/font/google";
import PageContainer from "@/components/layout/PageContainer";
import ProjectCard, { type Project } from "@/components/ProjectCard";

const INTRO =
  "Websites I've built for real businesses. They're all live, so go ahead and click around.";

export const metadata = {
  title: "Works",
  description:
    "Websites Anas has built for real businesses, including a cardamom exporter, two matchmaking services and an exam-preparation app.",
};

/*
 * Each card's title is set in the font of the site it shows. They're loaded
 * here, so they only ship with this page. Descriptions use this site's font.
 */
const outfit = Outfit({ subsets: ["latin"], weight: "700" });
const yesevaOne = Yeseva_One({ subsets: ["latin"], weight: "400" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "600" });

const works: Project[] = [
  {
    title: "AYA Enterprises",
    description:
      "A cardamom exporter based in Idukki, Kerala, supplying the spice to buyers around the world. The website tells the company's story, shows its green cardamom in different pod sizes, and makes it easy for overseas customers to get in touch for bulk and wholesale orders.",
    url: "https://www.ayaenterprises.in/",
    logo: { src: "/images/works/aya.png", width: 625, height: 399 },
    panel: "#0f1f1a",
    titleFont: `${outfit.className} text-2xl font-bold`,
  },
  {
    title: "Valluvanad Matrimonial",
    description:
      "A marriage-matching service for Nair and Menon families from the Valluvanad region of Kerala. People create a profile, look through others who are searching for a partner, and can keep a horoscope on file. A paid membership adds extra features for those who want them.",
    url: "https://valluvanadmatrimonial.com/",
    logo: { src: "/images/works/valluvanad.png", width: 1500, height: 339 },
    panel: "#8c0e01",
    titleFont: `${yesevaOne.className} text-2xl`,
  },
  {
    title: "MeetMy Matrimonial",
    description:
      "A website that helps people find a life partner. Every profile is checked for a real identity and photo, members choose who can see their details, and they can search by values and lifestyle, not just age and location. A personal advisor can also pick suitable matches and arrange the first meeting.",
    url: "https://meetmymatrimonial.com/",
    logo: { src: "/images/works/meetmy.png", width: 1200, height: 384 },
    panel: "#ffffff",
    // Bebas Neue is condensed, so it needs more size and spacing to match
    titleFont: `${bebasNeue.className} text-3xl tracking-wider [word-spacing:0.2em]`,
  },
  {
    title: "Challenger App",
    description:
      "An app that helps people in Kerala prepare for the Public Service Commission (PSC) exams, the tests that lead to government jobs. It offers video classes and written notes, daily practice exams that feel like a game, and personal guidance from experienced mentors. The website introduces the app and links to download it.",
    url: "https://challengerapp.in/",
    // The white map of Kerala from the app's icon, on the app's own green
    logo: { src: "/images/works/challenger-map.png", width: 680, height: 1072 },
    panel: "#00b939",
    titleFont: `${poppins.className} text-2xl font-semibold`,
  },
];

export default function WorksPage() {
  return (
    <PageContainer>
      <header className="mb-12 md:mb-16">
        <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tighter text-text md:text-7xl">
          Works
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium text-text-secondary md:text-lg">
          {INTRO}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <ProjectCard key={work.title} project={work} />
        ))}
      </ul>
    </PageContainer>
  );
}
