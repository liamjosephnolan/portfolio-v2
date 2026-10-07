import data from "../content/site.json";
import sideProjects from "../data/side-projects.json";
import { getCollection } from "astro:content";

export const site = data;
export { sideProjects };

/** Projects in display order, used by the carousel and the case study pages. */
export async function getProjects() {
  const all = await getCollection("projects");
  return all.sort((a, b) => a.data.order - b.data.order);
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefix a root-relative path ("/assets/x.webp", "/#about") with the deploy base path. */
export function url(path: string) {
  if (/^([a-z]+:|#)/i.test(path)) return path;
  return BASE + (path.startsWith("/") ? path : `/${path}`);
}
