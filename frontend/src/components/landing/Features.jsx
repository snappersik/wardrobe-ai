import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Возможности', href: '#features' },
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'Отзывы', href: '#testimonials' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white">
            <div className="icon-shirt w-5 h-5"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">Умный Гардероб</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-[var(--primary-color)] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button className="btn btn-primary py-2 px-6 text-sm">
            Войти
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-50 p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className={`icon-${isMobileMenuOpen ? 'x' : 'menu'} w-6 h-6`}></div>
        </button>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 md:hidden">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-2xl font-medium text-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button className="btn btn-primary mt-4 w-40">
              Войти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
