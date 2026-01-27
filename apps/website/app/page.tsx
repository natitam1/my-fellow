import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Developers from "@/components/Developers";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Developers />
      </main>
    </div>
  );
}
