import { Link } from 'react-router-dom'

export default function FAB() {
    return (
        <Link
            to="/generator"
            className="fixed z-50 bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center hover:bg-primary-hover hover:scale-110 transition-all active:scale-95 group"
            aria-label="Create outfit"
        >
            <div className="icon-wand-sparkles w-7 h-7 group-hover:rotate-12 transition-transform duration-300"></div>
        </Link>
    )
}
