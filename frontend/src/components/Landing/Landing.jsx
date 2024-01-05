import React, { useEffect } from "react";
import Introduction from "./Introduction/Introduction";
import Features from "./Features/Features";
import Divider from "../Common/Divider";
import Footer from "../Common/Footer/Footer";
import About from "./About/About";

export default function Landing() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Add event listener for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Scroll to the initial hash if present
    handleHashChange();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      <Introduction id="home" />
      <Divider />
      <Features id="features" />
      <Divider />
      <About id="about" />
      <Divider />
      <Footer />
    </>
  );
}
