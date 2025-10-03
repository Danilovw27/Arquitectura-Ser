import React from 'react';

function HomeHooks() {
    const hooks = [
        { name: 'useState', path: '/useState', icon: '🎯', color: 'bg-blue-500' },
        { name: 'useNavigate', path: '/useNavigate', icon: '🧭', color: 'bg-purple-500' },
        { name: 'useEffect', path: '/useEffect', icon: '⚡', color: 'bg-yellow-500' },
        { name: 'useContext', path: '/useContext', icon: '🌐', color: 'bg-green-500' },
        { name: 'useReducer', path: '/useReducer', icon: '🔄', color: 'bg-red-500' },
        { name: 'useCallback', path: '/useCallback', icon: '🚀', color: 'bg-indigo-500' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        ⚛️ Ejemplos de Hooks
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Aprende React Hooks con ejemplos prácticos
                    </p>
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {hooks.map((hook) => (
                        <a
                            key={hook.name}
                            href={hook.path}
                            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className={`${hook.color} h-2 w-full`}></div>
                            <div className="p-6">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                    {hook.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {hook.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">
                                        Ver ejemplo
                                    </span>
                                    <svg 
                                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomeHooks;