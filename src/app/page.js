import Header from "./components/header";
import Hero from "./components/hero";


export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <Header />
      <Hero />
    </div>
  );
}
