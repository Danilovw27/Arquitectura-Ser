import React, { useState, useCallback, memo, useRef } from 'react';

// Componente hijo memoizado para demostrar re-renders
const ExpensiveChild = memo(({ onIncrement, title, color }) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    console.log(`${title} se renderizó ${renderCount.current} veces`);

    return (
        <div className={`border border-${color === 'success' ? 'green' : 'red'}-300 rounded-lg`}>
            <div className={`${color === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-t-lg`}>
                <h6 className="text-sm font-semibold">{title}</h6>
            </div>
            <div className="p-4">
                <p className="text-gray-700 mb-3">
                    Renders: <strong>{renderCount.current}</strong>
                </p>
                <button 
                    className={`px-4 py-2 rounded ${
                        color === 'success' 
                            ? 'border border-green-500 text-green-600 hover:bg-green-50' 
                            : 'border border-red-500 text-red-600 hover:bg-red-50'
                    } transition-colors`}
                    onClick={onIncrement}
                >
                    Incrementar
                </button>
            </div>
        </div>
    );
});

// Lista de items con búsqueda
const ItemList = memo(({ items, onItemClick }) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    return (
        <div className="border border-blue-300 rounded-lg">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg">
                <h6 className="text-sm font-semibold">📋 Lista de Items (Renders: {renderCount.current})</h6>
            </div>
            <div className="p-4">
                {items.length === 0 ? (
                    <p className="text-gray-500">No hay items</p>
                ) : (
                    <div className="space-y-2">
                        {items.map(item => (
                            <button
                                key={item.id}
                                className="w-full flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-blue-50 transition-colors"
                                onClick={() => onItemClick(item)}
                            >
                                <span>{item.name}</span>
                                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">{item.price}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

// Contador con búsqueda y filtros
const SearchCounter = memo(({ onSearch, searchTerm }) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    return (
        <div className="border border-green-300 rounded-lg">
            <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg">
                <h6 className="text-sm font-semibold">🔍 Buscador (Renders: {renderCount.current})</h6>
            </div>
            <div className="p-4">
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Buscar items..."
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
        </div>
    );
});

function UseCallbackExample() {
    const [count, setCount] = useState(0);
    const [otherValue, setOtherValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    // Datos mock
    const [items] = useState([
        { id: 1, name: 'Laptop', price: '$999' },
        { id: 2, name: 'Mouse', price: '$25' },
        { id: 3, name: 'Keyboard', price: '$75' },
        { id: 4, name: 'Monitor', price: '$299' },
        { id: 5, name: 'Webcam', price: '$89' }
    ]);

    // ❌ Función sin useCallback - se crea nueva en cada render
    const incrementWithoutCallback = () => {
        setCount(prev => prev + 1);
    };

    // ✅ Función con useCallback - solo se crea cuando cambian las dependencias
    const incrementWithCallback = useCallback(() => {
        setCount(prev => prev + 1);
    }, []); // Sin dependencias, función nunca cambia

    // ✅ Función con dependencias
    const incrementByValue = useCallback((value) => {
        setCount(prev => prev + value);
    }, []); // Función estable

    // ✅ useCallback para búsqueda
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    // ✅ useCallback para selección de item
    const handleItemClick = useCallback((item) => {
        setSelectedItem(item);
        console.log('Item seleccionado:', item);
    }, []);

    // ✅ Función de filtrado memoizada
    const filteredItems = useCallback(() => {
        return items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    // ❌ Función que cambia en cada render (para comparación)
    const handleOtherAction = () => {
        console.log('Acción ejecutada');
    };

    // ✅ Función memoizada que depende de un valor
    const getCountMessage = useCallback(() => {
        if (count === 0) return 'Contador en cero';
        if (count < 5) return 'Contador bajo';
        if (count < 10) return 'Contador medio';
        return 'Contador alto';
    }, [count]);

    // Event handler complejo memoizado
    const handleComplexAction = useCallback((actionType, data) => {
        switch (actionType) {
            case 'reset':
                setCount(0);
                setSearchTerm('');
                setSelectedItem(null);
                break;
            case 'double':
                setCount(prev => prev * 2);
                break;
            case 'increment':
                setCount(prev => prev + (data || 1));
                break;
            default:
                console.log('Acción desconocida:', actionType);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">🔄 useCallback Hook</h1>
                    <p className="text-lg text-gray-600">
                        Memoización de funciones para optimizar performance
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Contador principal */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
                                <h5 className="text-lg font-semibold">🎯 Contadores Principales</h5>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-blue-600">Count: {count}</h3>
                                        <p className="text-gray-600">{getCountMessage()}</p>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-gray-600">Other: {otherValue}</h3>
                                        <p className="text-gray-600">Valor independiente</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <button 
                                        className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                        onClick={() => setCount(count + 1)}
                                    >
                                        Count +1
                                    </button>
                                    <button 
                                        className="px-4 py-2 border border-gray-500 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                                        onClick={() => setOtherValue(otherValue + 1)}
                                    >
                                        Other +1
                                    </button>
                                    <button 
                                        className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                                        onClick={() => handleComplexAction('double')}
                                    >
                                        Doblar Count
                                    </button>
                                    <button 
                                        className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors"
                                        onClick={() => handleComplexAction('reset')}
                                    >
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Demostración de re-renders */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-yellow-500 text-black px-6 py-4 rounded-t-lg">
                                <h5 className="text-lg font-semibold">🔍 Comparación de Re-renders</h5>
                            </div>
                            <div className="p-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-blue-800">
                                        <strong>💡 Observa los contadores de renders:</strong><br/>
                                        - El componente "Con useCallback" se re-renderiza menos<br/>
                                        - El componente "Sin useCallback" se re-renderiza más frecuentemente<br/>
                                        - Abre la consola para ver los logs
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <ExpensiveChild
                                        onIncrement={incrementWithCallback}
                                        title="✅ Con useCallback"
                                        color="success"
                                    />
                                    <ExpensiveChild
                                        onIncrement={incrementWithoutCallback}
                                        title="❌ Sin useCallback"
                                        color="danger"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Búsqueda y filtrado */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
                                <h5 className="text-lg font-semibold">🔍 Búsqueda Optimizada</h5>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <SearchCounter
                                        onSearch={handleSearch}
                                        searchTerm={searchTerm}
                                    />
                                    <ItemList
                                        items={filteredItems()}
                                        onItemClick={handleItemClick}
                                    />
                                </div>

                                {selectedItem && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h6 className="font-semibold text-green-800">Item Seleccionado:</h6>
                                        <p className="text-green-700">
                                            <strong>{selectedItem.name}</strong> - {selectedItem.price}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ejemplos de uso avanzado */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-gray-600 text-white px-6 py-4 rounded-t-lg">
                                <h5 className="text-lg font-semibold">⚡ Acciones Complejas</h5>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Estas funciones usan useCallback para evitar recreación innecesaria:
                                </p>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                        onClick={() => incrementByValue(5)}
                                    >
                                        Incrementar por 5
                                    </button>
                                    <button 
                                        className="px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 transition-colors"
                                        onClick={() => handleComplexAction('increment', 3)}
                                    >
                                        Acción Compleja: +3
                                    </button>
                                    <button 
                                        className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                                        onClick={handleOtherAction}
                                    >
                                        Acción No Memoizada (ver console)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel de Información */}
                    <div className="space-y-6">
                        {/* Sintaxis */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg">
                                <h6 className="text-sm font-semibold">📝 Sintaxis useCallback</h6>
                            </div>
                            <div className="p-4 text-xs">
                                <div className="mb-3">
                                    <strong>Básico:</strong>
                                    <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
{`const memoizedFn = useCallback(
  () => {
    // función
  },
  [dependencies]
);`}
                                    </pre>
                                </div>

                                <div className="mb-3">
                                    <strong>Con parámetros:</strong>
                                    <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
{`const handleClick = useCallback(
  (id) => {
    setSelected(id);
  },
  [setSelected]
);`}
                                    </pre>
                                </div>

                                <div>
                                    <strong>Sin dependencias:</strong>
                                    <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
{`const increment = useCallback(
  () => setCount(c => c + 1),
  []
);`}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Cuándo usar */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-green-500 text-white px-4 py-3 rounded-t-lg">
                                <h6 className="text-sm font-semibold">✅ Cuándo Usar useCallback</h6>
                            </div>
                            <div className="p-4 text-xs">
                                <ul className="space-y-2">
                                    <li>
                                        <strong>🔄 Componentes memoizados:</strong><br/>
                                        Cuando pasas funciones a React.memo()
                                    </li>
                                    <li>
                                        <strong>⚡ Listas grandes:</strong><br/>
                                        Event handlers en listas con muchos items
                                    </li>
                                    <li>
                                        <strong>🎯 Dependencias de hooks:</strong><br/>
                                        En useEffect, useMemo dependencies
                                    </li>
                                    <li>
                                        <strong>🏗️ Funciones costosas:</strong><br/>
                                        Funciones que crean objetos complejos
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Cuándo NO usar */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-red-500 text-white px-4 py-3 rounded-t-lg">
                                <h6 className="text-sm font-semibold">❌ Cuándo NO Usar</h6>
                            </div>
                            <div className="p-4 text-xs">
                                <ul className="space-y-2">
                                    <li>
                                        <strong>🎭 Funciones simples:</strong><br/>
                                        Funciones muy simples (más costo que beneficio)
                                    </li>
                                    <li>
                                        <strong>🔄 Dependencias cambiantes:</strong><br/>
                                        Si las dependencias cambian en cada render
                                    </li>
                                    <li>
                                        <strong>🎯 Solo para "optimización":</strong><br/>
                                        Sin medición real de performance
                                    </li>
                                    <li>
                                        <strong>🧪 Casos prematuros:</strong><br/>
                                        Optimización prematura sin necesidad real
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Estado Actual */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg">
                                <h6 className="text-sm font-semibold">📊 Estado Actual</h6>
                            </div>
                            <div className="p-4 text-xs">
                                <table className="w-full">
                                    <tbody className="space-y-1">
                                        <tr className="border-b">
                                            <td className="py-1"><strong>Count:</strong></td>
                                            <td className="py-1">{count}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-1"><strong>Other Value:</strong></td>
                                            <td className="py-1">{otherValue}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-1"><strong>Search Term:</strong></td>
                                            <td className="py-1">{searchTerm || 'Vacío'}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-1"><strong>Filtered Items:</strong></td>
                                            <td className="py-1">{filteredItems().length}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1"><strong>Selected:</strong></td>
                                            <td className="py-1">{selectedItem ? selectedItem.name : 'Ninguno'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="bg-yellow-500 text-black px-4 py-3 rounded-t-lg">
                                <h6 className="text-sm font-semibold">💡 Tips y Trucos</h6>
                            </div>
                            <div className="p-4 text-xs">
                                <ul className="space-y-2">
                                    <li>
                                        <strong>🔍 Profiling:</strong> Usa React DevTools Profiler
                                    </li>
                                    <li>
                                        <strong>📏 Mide primero:</strong> Identifica cuellos de botella reales
                                    </li>
                                    <li>
                                        <strong>🤝 Combina con memo:</strong> useCallback + React.memo
                                    </li>
                                    <li>
                                        <strong>🎯 Dependencias correctas:</strong> Include all dependencies
                                    </li>
                                    <li>
                                        <strong>🧪 ESLint:</strong> Usa exhaustive-deps rule
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de regreso */}
                <div className="text-center mt-4">
                        <a 
                            href="/" 
                            className="btn btn-secondary btn-lg"
                        >
                            🏠 Volver al Home
                        </a>
                    </div>
            </div>
        </div>
    );
}

export default UseCallbackExample;