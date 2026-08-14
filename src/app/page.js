import HeroSection from "../components/HeroSection";
import ContentSection from "../components/ContentSection";
import CTASection from "../components/CTASection";

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <HeroSection />
            <ContentSection />
            <CTASection />
        </main>
    );
}