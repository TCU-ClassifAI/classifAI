import Introduction from "./Introduction/Introduction";
import Features from "./Features/Features";
import Divider from "../Common/Divider";
import Footer from "../Footer/Footer";
import About from "./About/About";

export default function Landing() {
  return (
    <>
      <Introduction></Introduction>
      <Divider></Divider>
      <Features></Features>
      <Divider></Divider>
      <About></About>
      <Divider></Divider>
      <Footer></Footer>
    </>
  );
}
