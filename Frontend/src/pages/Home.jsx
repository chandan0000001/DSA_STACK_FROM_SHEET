import React from "react";
import HeroSection from "../sections/HeroSection";
import Sections from "../sections/Sections";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Sections /> 
      <Footer /> 
    </div>
  );
};

export default Home;