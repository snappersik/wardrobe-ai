import { Link } from 'react-router-dom';

const QuickActions = ({ actions }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, idx) => {
                    const Component = action.to ? Link : 'button';
                    return (
                        <Component
                            key={idx}
                            to={action.to}
                            onClick={action.onClick}
                            className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-pink-50 transition-all text-left"
                        >
                            <div className={`icon-${action.icon} text-xl text-gray-600 mb-2`}></div>
                            <p className="font-medium">{action.label}</p>
                        </Component>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;
