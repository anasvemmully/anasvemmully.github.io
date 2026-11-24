import { notFound } from "next/navigation";
import { cmsEnabled } from "@/lib/cms";
import KeystaticApp from "./keystatic";

export default function Layout() {
  if (!cmsEnabled) notFound();
  return <KeystaticApp />;
}
