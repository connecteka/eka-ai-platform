import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AboutUs from '../components/AboutUs';
import Testimonials from '../components/Testimonials';

const HomePage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero />
        <Features />
        <AboutUs />
        <Testimonials />
      </main>
    </div>
  );
};

export default HomePage;
