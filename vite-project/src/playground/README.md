HomeHooks.jsx

Este componente es la pantalla de inicio que muestra un menú con tarjetas para cada hook.  
Cada tarjeta incluye:
- Un **icono** representativo 🎯🧭⚡🌐🔄🚀  
- Un **color distintivo**  
- El **nombre del hook**  
- Un botón/enlace para acceder al ejemplo  

Funciona como punto de entrada visual para navegar entre los ejemplos de `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback` y `useNavigate`.

 useState – Estado en componentes

¿Qué es?
- Es el hook más básico de React.  
- Sirve para manejar **estado local** dentro de un componente funcional.  
- Cada vez que el estado cambia, el componente se vuelve a renderizar.

Ejemplo incluido (`UseStateExample.jsx`):**  
- Un **contador con pasos variables** (`+1, +5, +10`) y un botón de reset.  
- Un **input controlado** que muestra el nombre escrito por el usuario.  

Sintaxis básica:
```jsx
const [state, setState] = useState(initialValue);
```

 useEffect – Efectos secundarios

¿Qué es?  
- Permite ejecutar código en momentos específicos del ciclo de vida del componente.  
- Ejemplos: llamadas a APIs, timers, suscripciones a eventos.

Sintaxis básica:
```jsx
useEffect(() => {
  console.log("El componente se montó");
}, []);
```

 useContext – Compartir datos globales

¿Qué es?  
- Sirve para compartir información global sin necesidad de pasar props manualmente (*prop drilling*).  

Ejemplo incluido (`UseContextExample.jsx`):  
- `ThemeContext`: alterna entre tema claro y oscuro.  
- `UserContext`: maneja información del usuario.  
- `CounterContext`: contador global accesible desde cualquier parte.  

Sintaxis básica:
```jsx
const value = useContext(MyContext);
```


useReducer – Manejo avanzado de estado

¿Qué es?  
- Similar a `useState`, pero más útil cuando el estado es complejo.  
- Se basa en un reducer que define cómo cambia el estado según una acción.  

Ejemplo incluido (`UseReducerExample.jsx`):  
- **Contador avanzado** con incrementos personalizados.  
- **Lista de tareas** con agregar, completar y eliminar.  
- **Formulario validado** con nombre, correo y edad.  

Sintaxis básica:
```jsx
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: "increment" });
```


useCallback – Memorizar funciones

¿Qué es?  
- Memoriza funciones para evitar que se vuelvan a crear en cada render.  
- Útil cuando se pasan funciones como props a componentes hijos.  

Ejemplo incluido (`UseCallbackExample.jsx`):  
- Comparación entre funciones normales y funciones memoizadas.  
- Uso en **filtrado de listas** y **acciones de contador**.  
- Muestra en consola cuándo se re-renderiza un componente hijo.  

Sintaxis básica:
```jsx
const memoizedFn = useCallback(() => {
  console.log("Función memorizada");
}, []);


useNavigate – Navegación en React Router

¿Qué es? 
- Hook de **React Router** para navegar entre páginas de manera **programática**.  
- Permite ir a una ruta, volver atrás o adelante en el historial.  

Ejemplo incluido (`UseNavigateExample.jsx`):  
- Navegar a rutas predefinidas (`/home`, `/profile`, `/settings`...).  
- Campo de texto para navegar a rutas personalizadas.  
- Botones para **atrás**, **adelante** y limpiar historial.  
- Panel de historial con las últimas rutas visitadas.  

Sintaxis básica:
```jsx
const navigate = useNavigate();
navigate("/home");
navigate(-1); // atrás
navigate(1);  // adelante
```

