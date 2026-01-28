import { useState } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)

    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: false
    }

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startWeekDay = (firstDay.getDay() + 6) % 7

        const days = []
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        return days
    }

    const plannedOutfits = {
        5: { name: 'Деловой образ', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=100&q=80' },
        12: { name: 'Выходной день', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80' },
        18: { name: 'Вечерний лук', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=100&q=80' },
    }

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

    const days = getDaysInMonth(currentDate)
    const today = new Date().getDate()
    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="calendar" user={user} />

            <main className="flex-grow container mx-auto max-w-4xl px-4 md:px-6 py-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="icon-chevron-left w-5 h-5 text-gray-600"></div>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="icon-chevron-right w-5 h-5 text-gray-600"></div>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, idx) => (
                            <div
                                key={idx}
                                onClick={() => day && setSelectedDate(day)}
                                className={`aspect-square p-1 rounded-lg cursor-pointer transition-all ${day === null ? '' :
                                        day === today && isCurrentMonth ? 'bg-primary text-white' :
                                            plannedOutfits[day] ? 'bg-pink-50 hover:bg-pink-100' :
                                                selectedDate === day ? 'bg-gray-100' :
                                                    'hover:bg-gray-50'
                                    }`}
                            >
                                {day && (
                                    <div className="h-full flex flex-col items-center">
                                        <span className="text-sm font-medium">{day}</span>
                                        {plannedOutfits[day] && (
                                            <div className="w-6 h-6 rounded-full overflow-hidden mt-1">
                                                <img src={plannedOutfits[day].image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {selectedDate && plannedOutfits[selectedDate] && (
                    <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Запланированный образ на {selectedDate} число</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                                <img src={plannedOutfits[selectedDate].image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{plannedOutfits[selectedDate].name}</p>
                                <button className="text-sm text-primary font-medium mt-1">Изменить</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <MobileNav activePage="calendar" />
        </div>
    )
}
