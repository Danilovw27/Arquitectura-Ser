import React, { useState, useEffect } from 'react';

function UseEffectExample() {
    const [count, setCount] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Effect 1: Ejecutar en cada render
    useEffect(() => {
        document.title = `Contador: ${count}`;
        console.log('El componente se renderizó. Count:', count);
    });

    // Effect 2: Ejecutar solo una vez (componentDidMount)
    useEffect(() => {
        console.log('Componente montado');
        
        // Cleanup cuando se desmonta
        return () => {
            console.log('Componente se va a desmontar');
        };
    }, []); // Array vacío = solo una vez

    // Effect 3: Ejecutar cuando cambia una dependencia específica
    useEffect(() => {
        console.log(`El contador cambió a: ${count}`);
        
        if (count >= 10) {
            alert('¡Has llegado a 10!');
        }
    }, [count]); // Solo cuando cambia count

    // Effect 4: Event listeners con cleanup
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        const handleMouseMove = (event) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup: remover event listeners
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Solo una vez

    // Effect 5: Timer con cleanup
    useEffect(() => {
        let interval;

        if (isRunning) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        }

        // Cleanup: limpiar interval
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning]); // Cuando cambia isRunning

    const startTimer = () => setIsRunning(true);
    const stopTimer = () => setIsRunning(false);
    const resetTimer = () => {
        setIsRunning(false);
        setTimer(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="display-4 text-primary">⚡ useEffect Hook</h1>
                        <p className="lead text-muted">
                            Efectos secundarios en componentes funcionales
                        </p>
                    </div>

                    <div className="row">
                        <div className="col-lg-8">
                            {/* Ejemplo 1: Effect básico */}
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">📈 Effect en Cada Render</h5>
                                </div>
                                <div className="card-body text-center">
                                    <h2 className="display-4 text-primary mb-3">{count}</h2>
                                    <p className="text-muted mb-3">
                                        Observa cómo el título de la página cambia con cada click
                                    </p>
                                    <div className="btn-group">
                                        <button 
                                            className="btn btn-outline-danger"
                                            onClick={() => setCount(count - 1)}
                                        >
                                            ➖ Decrementar
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => setCount(0)}
                                        >
                                            🔄 Reset
                                        </button>
                                        <button 
                                            className="btn btn-outline-success"
                                            onClick={() => setCount(count + 1)}
                                        >
                                            ➕ Incrementar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Ejemplo 2: Timer */}
                            <div className="card mb-4">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">⏱️ Timer con Effect</h5>
                                </div>
                                <div className="card-body text-center">
                                    <h3 className="display-5 text-success mb-3 font-monospace">
                                        {formatTime(timer)}
                                    </h3>
                                    <div className="btn-group">
                                        <button 
                                            className="btn btn-success"
                                            onClick={startTimer}
                                            disabled={isRunning}
                                        >
                                            ▶️ Start
                                        </button>
                                        <button 
                                            className="btn btn-warning"
                                            onClick={stopTimer}
                                            disabled={!isRunning}
                                        >
                                            ⏸️ Pause
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={resetTimer}
                                        >
                                            🔄 Reset
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <span className={`badge ${isRunning ? 'bg-success' : 'bg-secondary'}`}>
                                            {isRunning ? '🟢 Corriendo' : '🔴 Detenido'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ejemplo 3: Event Listeners */}
                            <div className="card mb-4">
                                <div className="card-header bg-info text-white">
                                    <h5 className="mb-0">🖱️ Event Listeners</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-md-6">
                                            <h6 className="text-primary">Tamaño de Ventana</h6>
                                            <p className="fs-4 text-info">{windowWidth}px</p>
                                            <small className="text-muted">Redimensiona la ventana</small>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-primary">Posición del Mouse</h6>
                                            <p className="fs-4 text-info">
                                                X: {mousePosition.x}, Y: {mousePosition.y}
                                            </p>
                                            <small className="text-muted">Mueve el cursor</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Información */}
                        <div className="col-lg-4">
                            {/* Tipos de useEffect */}
                            <div className="card mb-4">
                                <div className="card-header bg-warning text-dark">
                                    <h6 className="mb-0">🔍 Tipos de useEffect</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong className="text-primary">Sin dependencias:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`useEffect(() => {
  // Se ejecuta en cada render
});`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong className="text-primary">Array vacío:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`useEffect(() => {
  // Solo una vez (mount)
}, []);`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong className="text-primary">Con dependencias:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`useEffect(() => {
  // Cuando cambia 'count'
}, [count]);`}</code>
                                        </pre>
                                    </div>

                                    <div>
                                        <strong className="text-primary">Con cleanup:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`useEffect(() => {
  // Setup
  return () => {
    // Cleanup
  };
}, []);`}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Casos de Uso */}
                            <div className="card mb-4">
                                <div className="card-header bg-secondary text-white">
                                    <h6 className="mb-0">💡 Casos de Uso Comunes</h6>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled small">
                                        <li className="mb-2">
                                            <strong>📡 API Calls:</strong><br/>
                                            Fetch data cuando se monta
                                        </li>
                                        <li className="mb-2">
                                            <strong>📝 DOM Updates:</strong><br/>
                                            Cambiar título, focus, etc.
                                        </li>
                                        <li className="mb-2">
                                            <strong>⏰ Timers:</strong><br/>
                                            setInterval, setTimeout
                                        </li>
                                        <li className="mb-2">
                                            <strong>👂 Event Listeners:</strong><br/>
                                            Scroll, resize, mouse, etc.
                                        </li>
                                        <li>
                                            <strong>🧹 Cleanup:</strong><br/>
                                            Limpiar subscripciones
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Estado Actual */}
                            <div className="card">
                                <div className="card-header bg-dark text-white">
                                    <h6 className="mb-0">📊 Estado Actual</h6>
                                </div>
                                <div className="card-body">
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr>
                                                <td><strong>Contador:</strong></td>
                                                <td>{count}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Timer:</strong></td>
                                                <td>{formatTime(timer)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Ventana:</strong></td>
                                                <td>{windowWidth}px</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Mouse X:</strong></td>
                                                <td>{mousePosition.x}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Mouse Y:</strong></td>
                                                <td>{mousePosition.y}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Timer activo:</strong></td>
                                                <td>
                                                    <span className={`badge ${isRunning ? 'bg-success' : 'bg-secondary'}`}>
                                                        {isRunning ? 'Sí' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información Técnica */}
                    <div className="card mt-4">
                        <div className="card-header bg-danger text-white">
                            <h5 className="mb-0">⚠️ Consideraciones Importantes</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-danger">❌ Errores Comunes:</h6>
                                    <ul className="small">
                                        <li>Olvidar el array de dependencias</li>
                                        <li>No hacer cleanup de timers</li>
                                        <li>No remover event listeners</li>
                                        <li>Infinite loops por dependencias</li>
                                        <li>Memory leaks por no limpiar</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-success">✅ Buenas Prácticas:</h6>
                                    <ul className="small">
                                        <li>Siempre incluir dependencias</li>
                                        <li>Usar cleanup cuando sea necesario</li>
                                        <li>Separar effects por responsabilidad</li>
                                        <li>Usar custom hooks para lógica compleja</li>
                                        <li>Testear el comportamiento</li>
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
        </div>
    );
}

export default UseEffectExample;