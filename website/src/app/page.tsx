import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Benefits } from '@/components/sections/Benefits';
import { Screenshots } from '@/components/sections/Screenshots';
import { TechStack } from '@/components/sections/TechStack';
import { DownloadCTA } from '@/components/sections/DownloadCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Benefits />
      <Screenshots />
      <TechStack />
      <DownloadCTA />
    </>
  );
}
