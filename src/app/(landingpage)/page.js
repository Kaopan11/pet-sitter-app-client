import HeroSection from "../../components/HeroSection";
import ContentSection from "../../components/ContentSection";
import CTASection from "../../components/CTASection";

// หน้า Landing Page หลัก ประกอบด้วย 3 ส่วน: แบนเนอร์แนะนำ + ค้นหา, เนื้อหาบริการ, และชวนสมัคร/ค้นหา
export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <HeroSection />
            <ContentSection />
            <CTASection />
        </main>
    );
}