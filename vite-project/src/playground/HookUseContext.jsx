import React, { useState, useContext, createContext } from 'react';

// Crear contextos
const ThemeContext = createContext();
const UserContext = createContext();
const CounterContext = createContext();

// Provider components
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const themeStyles = {
        light: {
            backgroundColor: '#ffffff',
            color: '#000000',
            borderColor: '#dee2e6'
        },
        dark: {
            backgroundColor: '#343a40',
            color: '#ffffff',
            borderColor: '#495057'
        }
    };

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            toggleTheme, 
            styles: themeStyles[theme] 
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

function UserProvider({ children }) {
    const [user, setUser] = useState({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'admin',
        preferences: {
            language: 'es',
            notifications: true
        }
    });

    const updateUser = (updates) => {
        setUser(prevUser => ({ ...prevUser, ...updates }));
    };

    const updatePreferences = (prefs) => {
        setUser(prevUser => ({
            ...prevUser,
            preferences: { ...prevUser.preferences, ...prefs }
        }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser, updatePreferences }}>
            {children}
        </UserContext.Provider>
    );
}

function CounterProvider({ children }) {
    const [count, setCount] = useState(0);

    const increment = () => setCount(prev => prev + 1);
    const decrement = () => setCount(prev => prev - 1);
    const reset = () => setCount(0);

    return (
        <CounterContext.Provider value={{ count, increment, decrement, reset }}>
            {children}
        </CounterContext.Provider>
    );
}

// Componentes que consumen contexto
function ThemeToggler() {
    const { theme, toggleTheme, styles } = useContext(ThemeContext);

    return (
        <div className="card mb-3" style={{ backgroundColor: styles.backgroundColor, color: styles.color, borderColor: styles.borderColor }}>
            <div className="card-body">
                <h6 className="card-title">🎨 Control de Tema</h6>
                <p className="card-text">Tema actual: <strong>{theme}</strong></p>
                <button 
                    className={`btn ${theme === 'light' ? 'btn-dark' : 'btn-light'}`}
                    onClick={toggleTheme}
                >
                    Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}
                </button>
            </div>
        </div>
    );
}

function UserProfile() {
    const { user, updateUser, updatePreferences } = useContext(UserContext);

    const handleNameChange = (e) => {
        updateUser({ name: e.target.value });
    };

    const handleEmailChange = (e) => {
        updateUser({ email: e.target.value });
    };

    const toggleNotifications = () => {
        updatePreferences({ notifications: !user.preferences.notifications });
    };

    return (
        <div className="card mb-3">
            <div className="card-header bg-info text-white">
                <h6 className="mb-0">👤 Perfil de Usuario</h6>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Nombre:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={user.name}
                                onChange={handleNameChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                value={user.email}
                                onChange={handleEmailChange}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <strong>Rol:</strong> 
                            <span className="badge bg-primary ms-2">{user.role}</span>
                        </div>
                        <div className="mb-3">
                            <strong>Idioma:</strong> 
                            <span className="badge bg-secondary ms-2">{user.preferences.language}</span>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={user.preferences.notifications}
                                onChange={toggleNotifications}
                            />
                            <label className="form-check-label">
                                Recibir notificaciones
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CounterDisplay() {
    const { count } = useContext(CounterContext);

    return (
        <div className="text-center mb-3">
            <h2 className="display-4 text-primary">{count}</h2>
            <p className="text-muted">Contador global</p>
        </div>
    );
}

function CounterControls() {
    const { increment, decrement, reset } = useContext(CounterContext);

    return (
        <div className="text-center mb-3">
            <div className="btn-group">
                <button className="btn btn-outline-danger" onClick={decrement}>
                    ➖ Decrementar
                </button>
                <button className="btn btn-outline-secondary" onClick={reset}>
                    🔄 Reset
                </button>
                <button className="btn btn-outline-success" onClick={increment}>
                    ➕ Incrementar
                </button>
            </div>
        </div>
    );
}

function NestedComponent() {
    const { theme, styles } = useContext(ThemeContext);
    const { user } = useContext(UserContext);
    const { count } = useContext(CounterContext);

    return (
        <div className="card" style={{ backgroundColor: styles.backgroundColor, color: styles.color, borderColor: styles.borderColor }}>
            <div className="card-body">
                <h6 className="card-title">🔗 Componente Anidado Profundo</h6>
                <p className="card-text small">
                    Este componente está muy anidado pero puede acceder fácilmente a todos los contextos:
                </p>
                <ul className="list-unstyled small">
                    <li><strong>Tema:</strong> {theme}</li>
                    <li><strong>Usuario:</strong> {user.name} ({user.role})</li>
                    <li><strong>Contador:</strong> {count}</li>
                    <li><strong>Notificaciones:</strong> {user.preferences.notifications ? 'Activas' : 'Inactivas'}</li>
                </ul>
            </div>
        </div>
    );
}

function UseContextExample() {
    return (
        <ThemeProvider>
            <UserProvider>
                <CounterProvider>
                    <UseContextContent />
                </CounterProvider>
            </UserProvider>
        </ThemeProvider>
    );
}

function UseContextContent() {
    const { styles } = useContext(ThemeContext);

    return (
        <div className="container mt-4" style={{ backgroundColor: styles.backgroundColor, color: styles.color, minHeight: '100vh' }}>
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="display-4 text-primary">🔗 useContext Hook</h1>
                        <p className="lead text-muted">
                            Comparte datos entre componentes sin prop drilling
                        </p>
                    </div>

                    <div className="row">
                        <div className="col-lg-8">
                            {/* Theme Context */}
                            <ThemeToggler />

                            {/* Counter Context */}
                            <div className="card mb-4">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">🔢 Contador Global</h5>
                                </div>
                                <div className="card-body">
                                    <CounterDisplay />
                                    <CounterControls />
                                </div>
                            </div>

                            {/* User Context */}
                            <UserProfile />

                            {/* Nested Component */}
                            <NestedComponent />
                        </div>

                        {/* Panel de Información */}
                        <div className="col-lg-4">
                            {/* Sintaxis */}
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">📝 Sintaxis useContext</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>1. Crear contexto:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const MyContext = createContext();`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong>2. Proveer valor:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`<MyContext.Provider value={data}>
  {children}
</MyContext.Provider>`}</code>
                                        </pre>
                                    </div>

                                    <div>
                                        <strong>3. Consumir:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const data = useContext(MyContext);`}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Ventajas */}
                            <div className="card mb-4">
                                <div className="card-header bg-success text-white">
                                    <h6 className="mb-0">✅ Ventajas</h6>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled small">
                                        <li className="mb-2">
                                            <strong>🚫 Sin Prop Drilling:</strong><br/>
                                            No pasar props por múltiples niveles
                                        </li>
                                        <li className="mb-2">
                                            <strong>🌍 Estado Global:</strong><br/>
                                            Compartir datos entre componentes
                                        </li>
                                        <li className="mb-2">
                                            <strong>🧹 Código Limpio:</strong><br/>
                                            Menos props innecesarias
                                        </li>
                                        <li>
                                            <strong>⚡ Performance:</strong><br/>
                                            Solo re-renderiza cuando cambia
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Casos de Uso */}
                            <div className="card mb-4">
                                <div className="card-header bg-warning text-dark">
                                    <h6 className="mb-0">💡 Casos de Uso</h6>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled small">
                                        <li className="mb-2">
                                            <strong>🎨 Temas:</strong> Dark/Light mode
                                        </li>
                                        <li className="mb-2">
                                            <strong>👤 Autenticación:</strong> Usuario actual
                                        </li>
                                        <li className="mb-2">
                                            <strong>🌐 Idioma:</strong> i18n/Localización
                                        </li>
                                        <li className="mb-2">
                                            <strong>🛒 Carrito:</strong> E-commerce state
                                        </li>
                                        <li>
                                            <strong>⚙️ Configuración:</strong> App settings
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Advertencias */}
                            <div className="card">
                                <div className="card-header bg-danger text-white">
                                    <h6 className="mb-0">⚠️ Consideraciones</h6>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled small">
                                        <li className="mb-2">
                                            <strong>🎯 No abuses:</strong><br/>
                                            Solo para datos realmente globales
                                        </li>
                                        <li className="mb-2">
                                            <strong>🔄 Re-renders:</strong><br/>
                                            Todo hijo re-renderiza si cambia
                                        </li>
                                        <li>
                                            <strong>🧪 Testing:</strong><br/>
                                            Necesitas wrapers para testing
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
        </div>
    );
}

export default UseContextExample;