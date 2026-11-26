import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Skills from "@/components/Skills/Skills";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";

export default function Home() {
	return (
		<>
			<Navbar />

			<main>
				<Hero />

				<Skills />

				{/* <Projects /> */}

				<Contact />
			</main>

			<Footer />
		</>
	);
}
