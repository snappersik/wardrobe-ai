import UniversalHeader from '../components/layout/UniversalHeader'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Testimonials from '../components/landing/Testimonials'
import CTA from '../components/landing/CTA'

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <UniversalHeader activePage="Главная" user={null} />
            <main className="flex-grow -mt-[80px]">
                <Hero />
                <Features />
                <HowItWorks />
                <Testimonials />
                <CTA />
            </main>
            <Footer />
        </div>
    )
}
