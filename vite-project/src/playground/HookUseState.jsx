import React, { useState } from 'react';

function UseStateExample() {
    const [count, setCount] = useState(0);
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');

    // Funciones para manejar el contador
    const incrementCount = () => {
        setCount(prevCount => prevCount + step);
    };

    const decrementCount = () => {
        setCount(prevCount => prevCount - step);
    };

    const resetCount = () => {
        setCount(0);
    };

    const handleStepChange = (event) => {
        const newStep = parseInt(event.target.value) || 1;
        setStep(newStep);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="display-4 text-primary">🎯 useState Hook</h1>
                        <p className="lead text-muted">
                            Manejo de estado local en componentes funcionales
                        </p>
                    </div>

                    {/* Ejemplo 1: Contador Simple */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">📊 Contador con Pasos Variables</h5>
                        </div>
                        <div className="card-body text-center">
                            <h2 className="display-3 text-primary mb-4">{count}</h2>
                            
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Tamaño del paso:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={step}
                                        onChange={handleStepChange}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                <div className="col-md-6 d-flex align-items-end">
                                    <div className="text-muted">
                                        <small>Incremento actual: +{step}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="btn-group mb-3" role="group">
                                <button 
                                    onClick={decrementCount} 
                                    className="btn btn-warning"
                                    disabled={count <= 0}
                                >
                                    ➖ Disminuir ({step})
                                </button>
                                <button 
                                    onClick={resetCount} 
                                    className="btn btn-secondary"
                                >
                                    🔄 Reset
                                </button>
                                <button 
                                    onClick={incrementCount} 
                                    className="btn btn-success"
                                >
                                    ➕ Aumentar ({step})
                                </button>
                            </div>

                            <div className="progress mb-3">
                                <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{width: `${Math.min((count / 100) * 100, 100)}%`}}
                                >
                                    {count > 0 ? `${Math.min(count, 100)}%` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ejemplo 2: Input Controlado */}
                    <div className="card mb-4">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">✏️ Input Controlado</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Escribe tu nombre:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Tu nombre aquí..."
                                />
                            </div>
                            
                            {name && (
                                <div className="alert alert-success">
                                    <h5>¡Hola, {name}! 👋</h5>
                                    <p>Has escrito {name.length} caracteres.</p>
                                    {name.length > 10 && (
                                        <small className="text-muted">¡Wow, tienes un nombre largo!</small>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Explicación Técnica */}
                    <div className="card mb-4">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">🧠 ¿Cómo funciona useState?</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-primary">Sintaxis:</h6>
                                    <pre className="bg-light p-2 rounded">
                                        <code>{`const [state, setState] = useState(initialValue);`}</code>
                                    </pre>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-primary">Características:</h6>
                                    <ul className="list-unstyled">
                                        <li>✅ Estado local del componente</li>
                                        <li>✅ Preserva valor entre renders</li>
                                        <li>✅ Trigger de re-renderizado</li>
                                        <li>✅ Puede ser cualquier tipo de dato</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-3">
                                <h6 className="text-primary">Ejemplos en este componente:</h6>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="card bg-light">
                                            <div className="card-body p-2">
                                                <small>
                                                    <strong>Contador:</strong><br/>
                                                    <code>useState(0)</code><br/>
                                                    <span className="text-muted">Número inicial: 0</span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light">
                                            <div className="card-body p-2">
                                                <small>
                                                    <strong>Paso:</strong><br/>
                                                    <code>useState(1)</code><br/>
                                                    <span className="text-muted">Número inicial: 1</span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light">
                                            <div className="card-body p-2">
                                                <small>
                                                    <strong>Nombre:</strong><br/>
                                                    <code>useState('')</code><br/>
                                                    <span className="text-muted">String vacío inicial</span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón de regreso */}
                    <div className="text-center">
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

export default UseStateExample;