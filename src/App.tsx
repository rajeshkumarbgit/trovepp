import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Overview from './sections/Overview';
import PhaseSection from './sections/PhaseSection';
import Approach from './sections/Approach';
import Contact from './sections/Contact';
import { phases } from './data/content';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Hero />
        <Overview />
        {phases.map((p) => (
          <PhaseSection key={p.slug} phase={p} />
        ))}
        <Approach />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
