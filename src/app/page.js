import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <HeroSection />
        </main>
    );
}