import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30 dark:bg-black dark:text-zinc-50">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
