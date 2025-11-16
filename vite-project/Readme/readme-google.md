# Autenticación con Google - Learn Flow

## Descripción

La autenticación con Google permite a los usuarios iniciar sesión en Learn Flow utilizando sus cuentas de Google existentes. Este método proporciona:

- ✅ Inicio de sesión rápido y seguro
- ✅ No requiere crear una contraseña nueva
- ✅ Sincronización automática de datos del perfil
- ✅ Posibilidad de vincular con otros métodos de autenticación

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. **Cuenta de Firebase** activa
2. **Proyecto de Firebase** creado
3. **Node.js** instalado (v14 o superior)
4. **Dependencias de Firebase** instaladas:
   ```bash
   npm install firebase
   ```

---

## Configuración en Firebase Console

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication**

### Paso 2: Habilitar el proveedor de Google

1. Haz clic en la pestaña **Sign-in method**
2. Busca **Google** en la lista de proveedores
3. Haz clic en **Google**

### Paso 3: Configurar el proveedor

1. Activa el interruptor **Enable** (Habilitar)
2. Configura los campos requeridos:
   - **Project support email**: Selecciona tu email de soporte
   - **Project public-facing name**: "Learn Flow" (o el nombre de tu proyecto)
3. Haz clic en **Save** (Guardar)

**Importante:**

- El email de soporte será visible para los usuarios durante el proceso de autenticación
- Este email debe estar verificado en tu cuenta de Google

---

### Paso 4: Obtener credenciales

Firebase automáticamente configura las credenciales necesarias. Puedes verificarlas en:

1. **Project Settings** > **General**
2. Sección **Your apps**
3. Copia tu `firebaseConfig`

---

### Paso 5: Configurar dominios autorizados

1. En **Authentication** > **Settings**
2. Pestaña **Authorized domains**
3. Asegúrate de tener agregados:
   - `localhost` (para desarrollo)
   - Tu dominio de producción (https://arquitecturaos.web.app/)

---

## Configuración en el Proyecto

### 1. Estructura de archivos

```
src/
├── firebase.js          # Configuración de Firebase
├── pages/
│   ├── Login.jsx       # Componente de Login
│   └── Profile.jsx     # Componente de Perfi
```

---

### 2. Archivo `firebase.js`

Crea o actualiza tu archivo de configuración de Firebase:

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar proveedor de Google
export const GoogleProvider = new GoogleAuthProvider();
GoogleProvider.setCustomParameters({
  prompt: "select_account", // Forzar selección de cuenta
});
```

**📝 Notas:**

- `prompt: 'select_account'` fuerza al usuario a seleccionar una cuenta cada vez
- Esto evita problemas con múltiples cuentas de Google

---

## 💻 Implementación del Código

### 1. Login con Google - `Login.jsx`

```javascript
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, GoogleProvider, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";

const Login = () => {
  const [loading, setLoading] = useState(false);

  // Función para guardar/actualizar usuario en Firestore
  const saveUserToFirestore = async (user, provider) => {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Crear nuevo usuario
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providers: [provider.providerId],
        authProvider: provider.providerId,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isOnline: true,
      });
    } else {
      // Actualizar último login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        isOnline: true,
        authProvider: provider.providerId,
      });
    }
  };

  // Función para registrar sesión en historial
  const registerSessionLog = async (user, provider) => {
    const sessionData = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: provider.providerId,
      loginTime: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };

    await addDoc(collection(db, "session_logs"), sessionData);
  };

  // Handler principal para login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 1. Abrir popup de autenticación
      const result = await signInWithPopup(auth, GoogleProvider);
      const user = result.user;

      // 2. Guardar usuario en Firestore
      await saveUserToFirestore(user, user.providerData[0]);

      // 3. Registrar sesión en historial
      await registerSessionLog(user, user.providerData[0]);

      // 4. Mostrar mensaje de éxito
      Swal.fire("¡Bienvenido!", "Has iniciado sesión con Google", "success");

      // 5. Redirigir al dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login con Google:", error);

      // Manejo de errores específicos
      if (error.code === "auth/popup-closed-by-user") {
        // Usuario cerró el popup - no mostrar error
        return;
      }

      if (error.code === "auth/cancelled-popup-request") {
        return;
      }

      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* SVG de Google */}
      </svg>
    </button>
  );
};
```

---

### 2. Vincular Google desde el Perfil - `Profile.jsx`

```javascript
import { linkWithPopup } from "firebase/auth";

const handleGoogleLink = async () => {
  setLinking(true);
  try {
    // Vincular Google a la cuenta actual
    const result = await linkWithPopup(auth.currentUser, GoogleProvider);

    // Actualizar Firestore
    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
      providers: arrayUnion("google.com"),
      updatedAt: serverTimestamp(),
    });

    // Registrar vinculación en historial
    await registerLinkSession(result.user, "google.com", "Google");

    Swal.fire("✅ Vinculado", "Google vinculado exitosamente", "success");
  } catch (error) {
    if (error.code === "auth/credential-already-in-use") {
      Swal.fire("Error", "Esta cuenta de Google ya está en uso", "error");
    }
  } finally {
    setLinking(false);
  }
};
```

---

## 🔄 Flujo de Autenticación

### Secuencia de eventos

1. **Click en botón "Sign in with Google"**

   - Se llama a `handleGoogleLogin()`
   - Estado `loading` se activa

2. **Popup de autenticación**

   - Firebase abre popup de Google
   - Usuario ve lista de cuentas disponibles

3. **Selección de cuenta**

   - Usuario elige una cuenta
   - Google solicita permisos

4. **Autorización**

   - Usuario acepta permisos
   - Google devuelve token a Firebase

5. **Procesamiento en Firebase**

   - Firebase valida el token
   - Crea o actualiza el usuario en Authentication

6. **Guardado en Firestore**

   - Se verifica si el usuario existe
   - Se crea o actualiza el documento en `usuarios`

7. **Registro de sesión**

   - Se crea documento en `session_logs`
   - Se guarda información del login

8. **Redirección**
   - Usuario es redirigido al Dashboard
   - Estado `loading` se desactiva

---

## Manejo de Errores

### Errores comunes y soluciones

| Código de Error                                 | Causa                                           | Solución                              |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| `auth/popup-closed-by-user`                     | Usuario cerró el popup antes de completar       | No mostrar error, es intencional      |
| `auth/popup-blocked`                            | Navegador bloqueó el popup                      | Solicitar al usuario permitir popups  |
| `auth/cancelled-popup-request`                  | Se abrió otro popup antes de cerrar el anterior | Deshabilitar botón durante el proceso |
| `auth/account-exists-with-different-credential` | Email ya registrado con otro método             | Ofrecer vincular cuentas              |
| `auth/credential-already-in-use`                | Cuenta Google ya vinculada a otro usuario       | Informar que debe usar otra cuenta    |
| `auth/operation-not-allowed`                    | Google no está habilitado en Firebase           | Verificar configuración en Console    |

---

### Implementación de manejo de errores

```javascript
const handleGoogleLogin = async () => {
  try {
    // ... código de autenticación
  } catch (error) {
    switch (error.code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        // No hacer nada, el usuario canceló intencionalmente
        break;

      case "auth/popup-blocked":
        Swal.fire({
          icon: "warning",
          title: "Popup bloqueado",
          text: "Por favor permite los popups para este sitio",
        });
        break;

      case "auth/account-exists-with-different-credential":
        Swal.fire({
          icon: "info",
          title: "Cuenta existente",
          text: "Este email ya está registrado con otro método",
        });
        break;

      default:
        Swal.fire("Error", error.message, "error");
    }
  }
};
```

---

## 🧪 Pruebas

### Checklist de pruebas

- [ ] **Login exitoso con cuenta Google nueva**

  - Verificar creación en Firebase Authentication
  - Verificar creación de documento en Firestore
  - Verificar registro en session_logs

- [ ] **Login con cuenta Google existente**

  - Verificar actualización de lastLogin
  - Verificar nuevo registro en session_logs

- [ ] **Vincular Google desde perfil**

  - Login con email/password
  - Ir a perfil y vincular Google
  - Verificar que solo se registre la vinculación

- [ ] **Manejo de errores**

  - Cerrar popup antes de completar
  - Intentar con cuenta ya vinculada
  - Probar con popups bloqueados

- [ ] **Logout y re-login**
  - Cerrar sesión
  - Volver a iniciar con Google
  - Verificar que funcione correctamente

---

## 🔍 Troubleshooting

### Problema: Popup no se abre

**Síntomas:** Al hacer clic, nada sucede o aparece brevemente y se cierra

**Causas posibles:**

1. Navegador está bloqueando popups
2. Extensiones del navegador interfiriendo
3. Modo incógnito con restricciones

**Soluciones:**

```javascript
// Agregar try-catch específico
try {
  const result = await signInWithPopup(auth, GoogleProvider);
} catch (error) {
  if (error.code === "auth/popup-blocked") {
    // Informar al usuario
    alert("Por favor permite los popups para este sitio");
  }
}
```

---

### Problema: Error de CORS

**Síntomas:** Error en consola sobre CORS policy

**Solución:** Verificar que el dominio esté en la lista de dominios autorizados en Firebase

1. Firebase Console > Authentication > Settings
2. Authorized domains > Add domain
3. Agregar `localhost` y tu dominio de producción

---

### Problema: Usuario no se guarda en Firestore

**Síntomas:** Login exitoso pero no aparece en Firestore

**Verificar:**

1. Reglas de seguridad de Firestore
2. Nombre correcto de la colección
3. Console.log para debug

```javascript
// Agregar logs para debug
const saveUserToFirestore = async (user, provider) => {
  console.log("Guardando usuario:", user.uid);
  try {
    await setDoc(doc(db, "usuarios", user.uid), {
      // ... datos
    });
    console.log("Usuario guardado exitosamente");
  } catch (error) {
    console.error("Error guardando usuario:", error);
  }
};
```

---

## Notas adicionales

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Autor:** Learn Flow Team
