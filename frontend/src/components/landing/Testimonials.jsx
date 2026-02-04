import { useState, useEffect, useRef, useCallback } from 'react'

export default function Testimonials() {
    const reviews = [
        {
            name: 'Анна Петрова',
            role: 'Fashion-блогер',
            image: 'https://img.freepik.com/free-photo/beautiful-girl-stands-park_8353-5084.jpg?semt=ais_hybrid&w=740&q=80',
            text: 'Это приложение полностью изменило мой подход к одежде. Я нашла десятки новых сочетаний из вещей, которые пылились годами!',
        },
        {
            name: 'Мария Иванова',
            role: 'Бизнес-аналитик',
            image: 'https://img.freepik.com/free-photo/attractive-positive-elegant-young-woman-cafe_23-2148071691.jpg?semt=ais_hybrid&w=740&q=80',
            text: 'Экономит мне 15 минут каждое утро. Просто открываю приложение и вижу готовый лук для офиса. Гениально!',
        },
        {
            name: 'Елена Смирнова',
            role: 'Студентка',
            image: 'https://klev.club/uploads/posts/2023-10/1698651140_klev-club-p-kartinki-topovie-devushki-42.jpg',
            text: 'Очень нравится минималистичный дизайн и то, как быстро работает AI. Чувствую себя как с личным стилистом.',
        },
        {
            name: 'Ольга Кузнецова',
            role: 'Маркетолог',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80',
            text: 'Наконец-то нашла приложение, которое понимает мой стиль. Рекомендую всем, кто хочет выглядеть стильно без усилий!',
        },
        {
            name: 'Дарья Волкова',
            role: 'Дизайнер',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
            text: 'AI предлагает такие сочетания, до которых я бы сама не додумалась. Это как иметь персонального стилиста 24/7.',
        }
    ]

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [slideDirection, setSlideDirection] = useState(null) // 'next' | 'prev'
    const sliderRef = useRef(null)

    const AUTO_SCROLL_INTERVAL = 3500 // 3.5 секунды на чтение
    const FIXED_CARD_HEIGHT = 280 // Фиксированная высота карточки

    // Автопрокрутка
    useEffect(() => {
        if (isHovered || isDragging) return

        const interval = setInterval(() => {
            animateToSlide(currentIndex + 1, 'next')
        }, AUTO_SCROLL_INTERVAL)

        return () => clearInterval(interval)
    }, [isHovered, isDragging, currentIndex, reviews.length])

    const animateToSlide = useCallback((index, direction) => {
        if (isAnimating) return

        setIsAnimating(true)
        setSlideDirection(direction)

        // Небольшая задержка для плавной анимации
        setTimeout(() => {
            if (index < 0) {
                setCurrentIndex(reviews.length - 1)
            } else if (index >= reviews.length) {
                setCurrentIndex(0)
            } else {
                setCurrentIndex(index)
            }

            setTimeout(() => {
                setIsAnimating(false)
                setSlideDirection(null)
            }, 50)
        }, 300)
    }, [isAnimating, reviews.length])

    const goNext = () => animateToSlide(currentIndex + 1, 'next')
    const goPrev = () => animateToSlide(currentIndex - 1, 'prev')

    // Touch/drag handlers
    const handleDragStart = (e) => {
        if (isAnimating) return
        setIsDragging(true)
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
        setDragStart(clientX)
        setDragOffset(0)
    }

    const handleDragMove = (e) => {
        if (!isDragging) return
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
        setDragOffset(clientX - dragStart)
    }

    const handleDragEnd = () => {
        if (!isDragging) return
        setIsDragging(false)

        const threshold = 80 // минимальный свайп для переключения
        if (dragOffset > threshold) {
            goPrev()
        } else if (dragOffset < -threshold) {
            goNext()
        }
        setDragOffset(0)
    }

    // Получаем индексы видимых слайдов
    const getVisibleIndices = () => {
        const prev = (currentIndex - 1 + reviews.length) % reviews.length
        const next = (currentIndex + 1) % reviews.length
        return { prev, current: currentIndex, next }
    }

    const { prev, current, next } = getVisibleIndices()

    // Получаем стили анимации для слайдов
    const getSlideAnimation = (position) => {
        const baseTransition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'

        if (position === 'center') {
            return {
                transform: `scale(1.05) translateX(${dragOffset}px)`,
                opacity: 1,
                transition: isDragging ? 'none' : baseTransition,
            }
        }

        if (position === 'left') {
            const exitOffset = slideDirection === 'next' && isAnimating ? -50 : 0
            return {
                transform: `scale(0.85) translateX(${dragOffset * 0.3 + exitOffset}px)`,
                opacity: isAnimating && slideDirection === 'next' ? 0.3 : 0.6,
                transition: isDragging ? 'none' : baseTransition,
            }
        }

        if (position === 'right') {
            const exitOffset = slideDirection === 'prev' && isAnimating ? 50 : 0
            return {
                transform: `scale(0.85) translateX(${dragOffset * 0.3 + exitOffset}px)`,
                opacity: isAnimating && slideDirection === 'prev' ? 0.3 : 0.6,
                transition: isDragging ? 'none' : baseTransition,
            }
        }
    }

    // Звезда SVG компонент
    const StarIcon = ({ filled }) => (
        <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill={filled ? "var(--primary-color)" : "none"}
            stroke="var(--primary-color)"
            strokeWidth="1.5"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    )

    return (
        <section id="testimonials" className="section-padding bg-surface overflow-hidden">
            <div className="container-custom">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Что говорят пользователи</h2>

                {/* Slider container */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Navigation arrows */}
                    <button
                        onClick={goPrev}
                        disabled={isAnimating}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
                        aria-label="Предыдущий отзыв"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={goNext}
                        disabled={isAnimating}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
                        aria-label="Следующий отзыв"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Gradient overlays (full viewport edges) */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-screen z-10 pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f5f5f5] to-transparent" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f5f5f5] to-transparent" />
                    </div>

                    {/* Slider track with fixed height */}
                    <div
                        ref={sliderRef}
                        className="flex items-center justify-center gap-6 px-16 py-8 select-none"
                        style={{
                            cursor: isDragging ? 'grabbing' : 'grab',
                            minHeight: FIXED_CARD_HEIGHT + 80, // карточка + padding
                        }}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                    >
                        {/* Previous slide */}
                        <div
                            className="hidden md:flex flex-shrink-0 w-80"
                            style={getSlideAnimation('left')}
                        >
                            <ReviewCard
                                review={reviews[prev]}
                                StarIcon={StarIcon}
                                fixedHeight={FIXED_CARD_HEIGHT}
                            />
                        </div>

                        {/* Current slide */}
                        <div
                            className="flex-shrink-0 w-full md:w-96 z-10"
                            style={getSlideAnimation('center')}
                        >
                            <ReviewCard
                                review={reviews[current]}
                                StarIcon={StarIcon}
                                isActive
                                fixedHeight={FIXED_CARD_HEIGHT}
                            />
                        </div>

                        {/* Next slide */}
                        <div
                            className="hidden md:flex flex-shrink-0 w-80"
                            style={getSlideAnimation('right')}
                        >
                            <ReviewCard
                                review={reviews[next]}
                                StarIcon={StarIcon}
                                fixedHeight={FIXED_CARD_HEIGHT}
                            />
                        </div>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {reviews.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => !isAnimating && animateToSlide(idx, idx > currentIndex ? 'next' : 'prev')}
                                className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentIndex
                                    ? 'bg-primary w-8'
                                    : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                                    }`}
                                aria-label={`Перейти к отзыву ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// Иконка цитаты
function QuoteIcon() {
    return (
        <svg
            className="w-8 h-8 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="var(--primary-color)"
        >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
    )
}

// Отдельный компонент карточки отзыва
function ReviewCard({ review, StarIcon, isActive, fixedHeight }) {
    return (
        <div
            className={`bg-white p-8 rounded-3xl transition-all duration-300 w-full flex flex-col ${isActive ? 'shadow-xl' : 'shadow-sm hover:shadow-md'
                }`}
            style={{
                height: fixedHeight,
                minHeight: fixedHeight,
                maxHeight: fixedHeight,
            }}
        >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <img
                        src={review.image}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover"
                        draggable={false}
                    />
                    <div>
                        <h4 className="font-bold">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                </div>
                <QuoteIcon />
            </div>
            <p className="text-gray-600 italic leading-relaxed flex-grow flex items-center overflow-hidden">
                {review.text}
            </p>
            <div className="mt-4 flex gap-1 flex-shrink-0">
                {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} filled />)}
            </div>
        </div>
    )
}

