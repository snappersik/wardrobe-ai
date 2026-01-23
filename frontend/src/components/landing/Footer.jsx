import { useState, useEffect } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-12 border-t border-gray-100" data-name="Footer" data-file="components/Footer.js">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
               <div className="icon-shirt w-5 h-5"></div>
            </div>
            <span className="font-bold text-xl">Умный Гардероб</span>
          </div>

          <div className="flex gap-8 text-gray-500 text-sm">
            <a href="#" className="hover:text-[var(--primary-color)]">О нас</a>
            <a href="#" className="hover:text-[var(--primary-color)]">Конфиденциальность</a>
            <a href="#" className="hover:text-[var(--primary-color)]">Условия</a>
            <a href="#" className="hover:text-[var(--primary-color)]">Поддержка</a>
          </div>

          <div className="text-gray-400 text-sm">
            © {currentYear} Умный Гардероб. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;