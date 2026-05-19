import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import OpenSourceSection from "@/components/OpenSourceSection";
import ProjectsSection from "@/components/ProjectsSection";
import ArticlesSection from "@/components/ArticlesSection";
import ContactSection from "@/components/ContactSection";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <OpenSourceSection />
      <ProjectsSection />
      <ArticlesSection />
      <ContactSection />
    </div>
  );
};

export default Index;
