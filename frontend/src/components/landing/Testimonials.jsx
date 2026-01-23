import { useState, useEffect } from 'react';

const Testimonials = () => {
  const reviews = [
    {
      name: 'Анна Петрова',
      role: 'Fashion-блогер',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      text: 'Это приложение полностью изменило мой подход к одежде. Я нашла десятки новых сочетаний из вещей, которые пылились годами!',
    },
    {
      name: 'Мария Иванова',
      role: 'Бизнес-аналитик',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
      text: 'Экономит мне 15 минут каждое утро. Просто открываю приложение и вижу готовый лук для офиса. Гениально!',
    },
    {
      name: 'Елена Смирнова',
      role: 'Студентка',
      image: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=100&q=80',
      text: 'Очень нравится минималистичный дизайн и то, как быстро работает AI. Чувствую себя как с личным стилистом.',
    }
  ];

  return (
    <section id="testimonials" className="section-padding bg-[var(--bg-surface)]" data-name="Testimonials" data-file="components/Testimonials.js">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Что говорят пользователи</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold">{review.name}</h4>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">"{review.text}"</p>
              <div className="mt-4 flex text-yellow-400 gap-1">
                {[1,2,3,4,5].map(star => <div key={star} className="icon-star w-4 h-4 fill-current"></div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;