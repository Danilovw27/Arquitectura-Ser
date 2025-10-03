import React, { useReducer, useState } from 'react';

// Counter Reducer
const counterReducer = (state, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return { count: state.count + (action.payload || 1) };
        case 'DECREMENT':
            return { count: state.count - (action.payload || 1) };
        case 'RESET':
            return { count: 0 };
        case 'SET':
            return { count: action.payload };
        default:
            throw new Error(`Unknown action: ${action.type}`);
    }
};

// Todo List Reducer
const todosReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                {
                    id: Date.now(),
                    text: action.payload,
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];
        case 'TOGGLE_TODO':
            return state.map(todo =>
                todo.id === action.payload
                    ? { ...todo, completed: !todo.completed }
                    : todo
            );
        case 'DELETE_TODO':
            return state.filter(todo => todo.id !== action.payload);
        case 'CLEAR_COMPLETED':
            return state.filter(todo => !todo.completed);
        case 'CLEAR_ALL':
            return [];
        default:
            return state;
    }
};

// Form Reducer
const formReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                [action.field]: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.field]: action.payload
                }
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                errors: {}
            };
        case 'RESET_FORM':
            return {
                name: '',
                email: '',
                age: '',
                errors: {}
            };
        default:
            return state;
    }
};

function UseReducerExample() {
    // Counter usando useReducer
    const [counterState, counterDispatch] = useReducer(counterReducer, { count: 0 });

    // Todo List usando useReducer
    const [todos, todosDispatch] = useReducer(todosReducer, []);
    const [newTodo, setNewTodo] = useState('');

    // Form usando useReducer
    const [formState, formDispatch] = useReducer(formReducer, {
        name: '',
        email: '',
        age: '',
        errors: {}
    });

    // Counter handlers
    const increment = (amount = 1) => {
        counterDispatch({ type: 'INCREMENT', payload: amount });
    };

    const decrement = (amount = 1) => {
        counterDispatch({ type: 'DECREMENT', payload: amount });
    };

    const resetCounter = () => {
        counterDispatch({ type: 'RESET' });
    };

    const setCounter = (value) => {
        counterDispatch({ type: 'SET', payload: value });
    };

    // Todo handlers
    const addTodo = () => {
        if (newTodo.trim()) {
            todosDispatch({ type: 'ADD_TODO', payload: newTodo.trim() });
            setNewTodo('');
        }
    };

    const toggleTodo = (id) => {
        todosDispatch({ type: 'TOGGLE_TODO', payload: id });
    };

    const deleteTodo = (id) => {
        todosDispatch({ type: 'DELETE_TODO', payload: id });
    };

    const clearCompleted = () => {
        todosDispatch({ type: 'CLEAR_COMPLETED' });
    };

    const clearAll = () => {
        todosDispatch({ type: 'CLEAR_ALL' });
    };

    // Form handlers
    const handleFieldChange = (field, value) => {
        formDispatch({ type: 'SET_FIELD', field, payload: value });
        
        // Clear error when user starts typing
        if (formState.errors[field]) {
            formDispatch({ type: 'SET_ERROR', field, payload: '' });
        }
    };

    const validateForm = () => {
        let isValid = true;
        
        if (!formState.name.trim()) {
            formDispatch({ type: 'SET_ERROR', field: 'name', payload: 'El nombre es requerido' });
            isValid = false;
        }
        
        if (!formState.email.trim()) {
            formDispatch({ type: 'SET_ERROR', field: 'email', payload: 'El email es requerido' });
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            formDispatch({ type: 'SET_ERROR', field: 'email', payload: 'Email inválido' });
            isValid = false;
        }
        
        if (!formState.age.trim()) {
            formDispatch({ type: 'SET_ERROR', field: 'age', payload: 'La edad es requerida' });
            isValid = false;
        } else if (isNaN(formState.age) || formState.age < 1 || formState.age > 120) {
            formDispatch({ type: 'SET_ERROR', field: 'age', payload: 'Edad debe ser entre 1 y 120' });
            isValid = false;
        }
        
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        formDispatch({ type: 'CLEAR_ERRORS' });
        
        if (validateForm()) {
            alert(`Formulario enviado:\n${JSON.stringify(formState, null, 2)}`);
            formDispatch({ type: 'RESET_FORM' });
        }
    };

    const resetForm = () => {
        formDispatch({ type: 'RESET_FORM' });
    };

    // Stats
    const completedTodos = todos.filter(todo => todo.completed).length;
    const pendingTodos = todos.length - completedTodos;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="display-4 text-primary">⚙️ useReducer Hook</h1>
                        <p className="lead text-muted">
                            Manejo de estado complejo con actions y reducers
                        </p>
                    </div>

                    <div className="row">
                        <div className="col-lg-8">
                            {/* Counter con useReducer */}
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">🔢 Contador Avanzado</h5>
                                </div>
                                <div className="card-body text-center">
                                    <h2 className="display-3 text-primary mb-4">{counterState.count}</h2>
                                    
                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-success w-100"
                                                onClick={() => increment(1)}
                                            >
                                                +1
                                            </button>
                                        </div>
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-success w-100"
                                                onClick={() => increment(5)}
                                            >
                                                +5
                                            </button>
                                        </div>
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-success w-100"
                                                onClick={() => increment(10)}
                                            >
                                                +10
                                            </button>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-warning w-100"
                                                onClick={() => decrement(1)}
                                            >
                                                -1
                                            </button>
                                        </div>
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-warning w-100"
                                                onClick={() => decrement(5)}
                                            >
                                                -5
                                            </button>
                                        </div>
                                        <div className="col-md-4">
                                            <button 
                                                className="btn btn-outline-warning w-100"
                                                onClick={() => decrement(10)}
                                            >
                                                -10
                                            </button>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <button 
                                                className="btn btn-secondary w-100"
                                                onClick={resetCounter}
                                            >
                                                🔄 Reset
                                            </button>
                                        </div>
                                        <div className="col-md-6">
                                            <button 
                                                className="btn btn-info w-100"
                                                onClick={() => setCounter(100)}
                                            >
                                                Set 100
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Todo List */}
                            <div className="card mb-4">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">📝 Lista de Tareas</h5>
                                </div>
                                <div className="card-body">
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nueva tarea..."
                                            value={newTodo}
                                            onChange={(e) => setNewTodo(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                                        />
                                        <button 
                                            className="btn btn-success"
                                            onClick={addTodo}
                                            disabled={!newTodo.trim()}
                                        >
                                            Agregar
                                        </button>
                                    </div>

                                    {todos.length === 0 ? (
                                        <p className="text-muted text-center">No hay tareas</p>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <span className="badge bg-info me-2">
                                                    Total: {todos.length}
                                                </span>
                                                <span className="badge bg-warning me-2">
                                                    Pendientes: {pendingTodos}
                                                </span>
                                                <span className="badge bg-success">
                                                    Completadas: {completedTodos}
                                                </span>
                                            </div>

                                            <div className="mb-3">
                                                <button 
                                                    className="btn btn-outline-warning btn-sm me-2"
                                                    onClick={clearCompleted}
                                                    disabled={completedTodos === 0}
                                                >
                                                    Limpiar Completadas
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={clearAll}
                                                    disabled={todos.length === 0}
                                                >
                                                    Limpiar Todo
                                                </button>
                                            </div>

                                            <div className="list-group">
                                                {todos.map(todo => (
                                                    <div 
                                                        key={todo.id} 
                                                        className={`list-group-item d-flex justify-content-between align-items-center ${todo.completed ? 'list-group-item-success' : ''}`}
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <input
                                                                className="form-check-input me-2"
                                                                type="checkbox"
                                                                checked={todo.completed}
                                                                onChange={() => toggleTodo(todo.id)}
                                                            />
                                                            <span 
                                                                className={todo.completed ? 'text-decoration-line-through text-muted' : ''}
                                                            >
                                                                {todo.text}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => deleteTodo(todo.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Form con useReducer */}
                            <div className="card mb-4">
                                <div className="card-header bg-warning text-dark">
                                    <h5 className="mb-0">📋 Formulario con Validación</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Nombre:</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${formState.errors.name ? 'is-invalid' : ''}`}
                                                        value={formState.name}
                                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                                    />
                                                    {formState.errors.name && (
                                                        <div className="invalid-feedback">
                                                            {formState.errors.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Email:</label>
                                                    <input
                                                        type="email"
                                                        className={`form-control ${formState.errors.email ? 'is-invalid' : ''}`}
                                                        value={formState.email}
                                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                                    />
                                                    {formState.errors.email && (
                                                        <div className="invalid-feedback">
                                                            {formState.errors.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Edad:</label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${formState.errors.age ? 'is-invalid' : ''}`}
                                                        value={formState.age}
                                                        onChange={(e) => handleFieldChange('age', e.target.value)}
                                                    />
                                                    {formState.errors.age && (
                                                        <div className="invalid-feedback">
                                                            {formState.errors.age}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button type="submit" className="btn btn-primary">
                                                Enviar
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={resetForm}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Información */}
                        <div className="col-lg-4">
                            {/* useState vs useReducer */}
                            <div className="card mb-4">
                                <div className="card-header bg-info text-white">
                                    <h6 className="mb-0">⚖️ useState vs useReducer</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong className="text-success">✅ Usa useReducer cuando:</strong>
                                        <ul className="list-unstyled small mt-2">
                                            <li>• Estado complejo (objetos/arrays)</li>
                                            <li>• Múltiples sub-valores</li>
                                            <li>• Lógica de estado compleja</li>
                                            <li>• Próximo estado depende del anterior</li>
                                            <li>• Muchas acciones diferentes</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <strong className="text-primary">📘 Usa useState cuando:</strong>
                                        <ul className="list-unstyled small mt-2">
                                            <li>• Estado simple (primitivos)</li>
                                            <li>• Pocas actualizaciones</li>
                                            <li>• Lógica simple</li>
                                            <li>• Estado independiente</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Anatomy of useReducer */}
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">🔍 Anatomía del useReducer</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>1. Reducer Function:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const reducer = (state, action) => {
  switch(action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong>2. Hook Usage:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const [state, dispatch] = 
  useReducer(reducer, initialState);`}</code>
                                        </pre>
                                    </div>

                                    <div>
                                        <strong>3. Dispatch Action:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`dispatch({ 
  type: 'INCREMENT',
  payload: 5 
});`}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Estado Actual */}
                            <div className="card mb-4">
                                <div className="card-header bg-secondary text-white">
                                    <h6 className="mb-0">📊 Estado Actual</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2">
                                        <strong>Contador:</strong> {counterState.count}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Total Tareas:</strong> {todos.length}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Pendientes:</strong> {pendingTodos}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Completadas:</strong> {completedTodos}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Form válido:</strong> 
                                        <span className={`badge ms-2 ${Object.keys(formState.errors).length === 0 && formState.name && formState.email && formState.age ? 'bg-success' : 'bg-danger'}`}>
                                            {Object.keys(formState.errors).length === 0 && formState.name && formState.email && formState.age ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Patrones Comunes */}
                            <div className="card">
                                <div className="card-header bg-dark text-white">
                                    <h6 className="mb-0">🎯 Patrones Comunes</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Action Creators:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const increment = (amount) => ({
  type: 'INCREMENT',
  payload: amount
});`}</code>
                                        </pre>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Lazy Initialization:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`const [state, dispatch] = useReducer(
  reducer, 
  null, 
  initFunction
);`}</code>
                                        </pre>
                                    </div>

                                    <div>
                                        <strong>Error Handling:</strong>
                                        <pre className="bg-light p-2 mt-1 rounded small">
                                            <code>{`default:
  throw new Error(
    'Unknown action: ' + action.type
  );`}</code>
                                        </pre>
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

export default UseReducerExample;