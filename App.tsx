import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollProgress from './components/ScrollProgress';

const App: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen font-sans bg-brand-beige selection:bg-brand-navy selection:text-white">
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default App;