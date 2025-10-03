import React, { useState } from 'react';

function UseNavigateExample() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [customRoute, setCustomRoute] = useState('');
    const [navigationHistory, setNavigationHistory] = useState([]);

    // Simular useNavigate para el ejemplo
    const navigate = (path) => {
        // En un proyecto real, esto sería el hook useNavigate de react-router-dom
        console.log(`Navegando a: ${path}`);
        setCurrentPath(path);
        setNavigationHistory(prev => [...prev, { path, timestamp: new Date().toLocaleTimeString() }]);
        
        // Para demostración, cambiar la URL sin recargar
        window.history.pushState({}, '', path);
    };

    const goBack = () => {
        window.history.back();
        setNavigationHistory(prev => [...prev, { path: 'BACK', timestamp: new Date().toLocaleTimeString() }]);
    };

    const goForward = () => {
        window.history.forward();
        setNavigationHistory(prev => [...prev, { path: 'FORWARD', timestamp: new Date().toLocaleTimeString() }]);
    };

    const navigateToCustomRoute = () => {
        if (customRoute.trim()) {
            navigate(customRoute);
            setCustomRoute('');
        }
    };

    const predefinedRoutes = [
        { path: '/home', name: '🏠 Home', description: 'Página principal' },
        { path: '/profile', name: '👤 Perfil', description: 'Perfil de usuario' },
        { path: '/settings', name: '⚙️ Configuración', description: 'Ajustes de la aplicación' },
        { path: '/about', name: 'ℹ️ Acerca de', description: 'Información del sitio' },
        { path: '/contact', name: '📞 Contacto', description: 'Formulario de contacto' }
    ];

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="display-4 text-primary">🧭 useNavigate Hook</h1>
                        <p className="lead text-muted">
                            Navegación programática con React Router
                        </p>
                        <div className="badge bg-info fs-6">
                            Ruta actual: <code>{currentPath}</code>
                        </div>
                    </div>

                    <div className="row">
                        {/* Panel de Navegación */}
                        <div className="col-lg-8">
                            {/* Rutas Predefinidas */}
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">🎯 Rutas Predefinidas</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {predefinedRoutes.map((route, index) => (
                                            <div key={index} className="col-md-6 mb-3">
                                                <div className="card h-100 border-light">
                                                    <div className="card-body d-flex flex-column">
                                                        <h6 className="card-title">{route.name}</h6>
                                                        <p className="card-text text-muted small flex-grow-1">
                                                            {route.description}
                                                        </p>
                                                        <button
                                                            onClick={() => navigate(route.path)}
                                                            className={`btn btn-sm ${currentPath === route.path ? 'btn-success' : 'btn-outline-primary'}`}
                                                        >
                                                            {currentPath === route.path ? '✅ Actual' : '🚀 Ir'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Navegación Personalizada */}
                            <div className="card mb-4">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">🎨 Navegación Personalizada</h5>
                                </div>
                                <div className="card-body">
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">🔗</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Escribe una ruta (ej: /mi-pagina)"
                                            value={customRoute}
                                            onChange={(e) => setCustomRoute(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && navigateToCustomRoute()}
                                        />
                                        <button
                                            className="btn btn-success"
                                            onClick={navigateToCustomRoute}
                                            disabled={!customRoute.trim()}
                                        >
                                            Navegar
                                        </button>
                                    </div>
                                    <small className="text-muted">
                                        Tip: Las rutas deben empezar con "/" (ej: /productos, /usuario/123)
                                    </small>
                                </div>
                            </div>

                            {/* Controles de Historial */}
                            <div className="card mb-4">
                                <div className="card-header bg-warning text-dark">
                                    <h5 className="mb-0">⏮️ Controles de Historial</h5>
                                </div>
                                <div className="card-body">
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={goBack}
                                        >
                                            ⬅️ Atrás
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={goForward}
                                        >
                                            ➡️ Adelante
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => setNavigationHistory([])}
                                        >
                                            🗑️ Limpiar Historial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Información */}
                        <div className="col-lg-4">
                            {/* Historial de Navegación */}
                            <div className="card mb-4">
                                <div className="card-header bg-info text-white">
                                    <h6 className="mb-0">📋 Historial de Navegación</h6>
                                </div>
                                <div className="card-body">
                                    {navigationHistory.length === 0 ? (
                                        <p className="text-muted small mb-0">
                                            No hay navegación registrada
                                        </p>
                                    ) : (
                                        <div className="overflow-auto" style={{maxHeight: '200px'}}>
                                            {navigationHistory.slice(-10).reverse().map((item, index) => (
                                                <div key={index} className="border-bottom pb-2 mb-2 small">
                                                    <div className="fw-bold">{item.path}</div>
                                                    <div className="text-muted">{item.timestamp}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información Técnica */}
                            <div className="card">
                                <div className="card-header bg-secondary text-white">
                                    <h6 className="mb-0">🧠 useNavigate Info</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong className="text-primary">Sintaxis:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const navigate = useNavigate();`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong className="text-primary">Uso básico:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`navigate('/ruta');
navigate(-1); // atrás
navigate(1);  // adelante`}</code>
                                        </pre>
                                    </div>

                                    <div>
                                        <strong className="text-primary">Características:</strong>
                                        <ul className="list-unstyled mt-2 small">
                                            <li>✅ Navegación programática</li>
                                            <li>✅ Reemplazo de history.push</li>
                                            <li>✅ Compatible con historial</li>
                                            <li>✅ Funciona con estado</li>
                                        </ul>
                                    </div>
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

export default UseNavigateExample;