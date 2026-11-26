import Navbar from "@/components/features/Navbar";
import Hero from "@/components/features/Hero";
import Skills from "@/components/features/Skills";
import Contact from "@/components/features/Contact";
import Footer from "@/components/features/Footer";

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
