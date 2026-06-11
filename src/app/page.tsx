import { preload } from "react-dom";
import { Loader } from "@/components/loader";
import { Hero } from "@/components/sections/hero";
import { Traits } from "@/components/sections/traits";
import { Turn } from "@/components/sections/turn";
import { Cta } from "@/components/sections/cta";

export default function Home() {
  preload("/media/hero-poster.webp", { as: "image", fetchPriority: "high" });
  return (
    <main>
      <Loader />
      <Hero />
      <Traits />
      <Turn />
      <Cta />
    </main>
  );
}
