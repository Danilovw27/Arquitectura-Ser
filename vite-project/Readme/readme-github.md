# Autenticación con GitHub - Learn Flow

## Descripción

La autenticación con GitHub permite a los usuarios iniciar sesión usando sus cuentas de GitHub. Ideal para aplicaciones orientadas a desarrolladores.

- ✅ Acceso rápido con cuenta de desarrollador
- ✅ Sincronización de información del perfil
- ✅ Audiencia técnica
- ✅ Integración con ecosistema de desarrollo

**Nota importante:** GitHub puede no proporcionar el email si el usuario lo tiene como privado.

---

## Requisitos Previos

1. **Cuenta de GitHub** (personal u organizacional)
2. **Proyecto en Firebase** configurado
3. **Dependencias instaladas:**
   ```bash
   npm install firebase
   ```

---

## Configuración en GitHub

### Paso 1: Crear OAuth App

1. Ve a [GitHub Settings](https://github.com/settings/developers)
2. Click en **OAuth Apps** en el menú izquierdo
3. Click en **New OAuth App**

---

### Paso 2: Completar información

| Campo                          | Valor                               |
| ------------------------------ | ----------------------------------- |
| **Application name**           | Learn Flow                          |
| **Homepage URL**               | `https://tu-dominio.com`            |
| **Application description**    | Plataforma de aprendizaje de inglés |
| **Authorization callback URL** | _Lo obtendremos de Firebase_        |

**Importante:** Deja el callback URL vacío por ahora.

---

### Paso 3: Generar credenciales

1. Una vez creada la app, verás tu **Client ID**
2. Click en **Generate a new client secret**
3. **COPIA INMEDIATAMENTE** el Client Secret (solo se muestra una vez)
4. Guárdalo en un lugar seguro

**Seguridad:** Nunca compartas el Client Secret.

---

## Configuración en Firebase Console

### Paso 1: Habilitar GitHub

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. **Authentication** > **Sign-in method**
4. Busca **GitHub** y haz clic

---

### Paso 2: Agregar credenciales

1. Activa el interruptor **Enable**
2. Pega tu **Client ID** de GitHub
3. Pega tu **Client Secret** de GitHub
4. **COPIA** la **Authorization callback URL** que Firebase te proporciona
5. Haz clic en **Save**

La URL será algo como:

```
https://arquitecturaos.firebaseapp.com/__/auth/handler
```

---

### Paso 3: Actualizar GitHub con callback URL

1. Regresa a [GitHub OAuth Apps](https://github.com/settings/developers)
2. Click en tu aplicación "Learn Flow"
3. En **Authorization callback URL**, pega la URL de Firebase
4. Click en **Update application**

---

## Configuración en el Proyecto

### 1. Estructura de archivos

```
src/
├── firebase.js          # Configuración de Firebase
├── pages/
│   ├── Login.jsx       # Componente de Login
│   └── Profile.jsx     # Componente de Perfil
```

---

### 2. Actualizar `firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar proveedor de GitHub
export const GithubProvider = new GithubAuthProvider();
GithubProvider.addScope("user:email"); // IMPORTANTE: Para obtener email
GithubProvider.setCustomParameters({
  allow_signup: "true",
  prompt: "select_account",
  login: "",
  auth_type: "reauthenticate",
});
```

**Importante:**

- `addScope('user:email')` es crítico para obtener el email del usuario
- Sin este scope, el email puede ser `null`

---

## Implementación del Código

### 1. Login con GitHub - `Login.jsx`

```javascript
import React, { useState } from "react";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const Login = () => {
  const [loading, setLoading] = useState(false);

  // Guardar usuario en Firestore
  const saveUserToFirestore = async (user, provider) => {
    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Sin nombre",
        photoURL: user.photoURL,
        providers: [provider.providerId],
        authProvider: provider.providerId,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isOnline: true,
      });
    } else {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        isOnline: true,
        authProvider: provider.providerId,
      });
    }
  };

  // Registrar sesión
  const registerSessionLog = async (user, provider) => {
    await addDoc(collection(db, "session_logs"), {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || "Sin nombre",
      photoURL: user.photoURL,
      provider: provider.providerId,
      loginTime: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
  };

  // Handler para login con GitHub
  const handleGithubLogin = async () => {
    setLoading(true);

    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope("user:email"); // CRÍTICO
    githubProvider.setCustomParameters({
      allow_signup: "true",
      prompt: "select_account",
      login: "",
      auth_type: "reauthenticate",
    });

    try {
      // 1. Autenticar con GitHub
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      // 2. IMPORTANTE: Verificar si tenemos email
      let userEmail = user.email;

      if (!userEmail) {
        // GitHub no proporcionó email (usuario lo tiene privado)
        const { value: email } = await Swal.fire({
          title: "Email requerido",
          text: "GitHub no compartió tu email. Por favor ingrésalo:",
          input: "email",
          inputPlaceholder: "tu@email.com",
          showCancelButton: true,
          confirmButtonText: "Continuar",
          cancelButtonText: "Cancelar",
          inputValidator: (value) => {
            if (!value || !value.includes("@")) {
              return "Por favor ingresa un email válido";
            }
          },
        });

        if (!email) {
          await auth.signOut();
          setLoading(false);
          return;
        }

        userEmail = email;
      }

      // 3. Crear usuario con email
      const userWithEmail = { ...user, email: userEmail };

      // 4. Guardar usuario
      await saveUserToFirestore(userWithEmail, user.providerData[0]);

      // 5. Registrar sesión
      await registerSessionLog(userWithEmail, user.providerData[0]);

      // 6. Éxito
      Swal.fire("¡Bienvenido!", "Has iniciado sesión con GitHub", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login con GitHub:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        Swal.fire({
          icon: "warning",
          title: "Cuenta existente",
          text: "Este email ya está registrado con otro método",
        });
        return;
      }

      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGithubLogin}
      disabled={loading}
      className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        {/* SVG de GitHub */}
      </svg>
    </button>
  );
};
```

---

### 2. Vincular GitHub desde Perfil - `Profile.jsx`

```javascript
import { linkWithPopup, GithubAuthProvider } from "firebase/auth";

const handleGithubLink = async () => {
  setLinking(true);
  try {
    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope("user:email");
    githubProvider.setCustomParameters({
      allow_signup: "false",
      prompt: "consent",
      login: auth.currentUser.email,
    });

    const result = await linkWithPopup(auth.currentUser, githubProvider);
    let finalEmail = result.user.email || auth.currentUser.email;

    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
      providers: arrayUnion("github.com"),
      email: finalEmail,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "session_logs"), {
      userId: auth.currentUser.uid,
      email: finalEmail,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL,
      provider: "github.com",
      loginTime: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isLinkAction: true,
    });

    Swal.fire("✅ Vinculado", `GitHub vinculado a ${finalEmail}`, "success");
  } catch (error) {
    if (error.code === "auth/provider-already-linked") {
      Swal.fire("ℹ️", "GitHub ya está vinculado", "info");
    } else if (error.code === "auth/credential-already-in-use") {
      Swal.fire("❌ Error", "Esta cuenta de GitHub ya está en uso", "error");
    }
  } finally {
    setLinking(false);
  }
};
```

---

## Flujo de Autenticación

1. **Click en botón GitHub** → Se abre popup de GitHub
2. **Usuario se autentica** → Ingresa credenciales si es necesario
3. **Acepta permisos** → Permite compartir datos
4. **Verificar email** → Si no está disponible, solicitar manualmente
5. **Firebase recibe token** → Valida credenciales
6. **Se guarda en Firestore** → Crea/actualiza documento
7. **Se registra sesión** → Crea entrada en `session_logs`
8. **Redirección** → Usuario va al Dashboard

---

## Manejo de Errores

### Errores comunes

| Código                                          | Descripción          | Solución            |
| ----------------------------------------------- | -------------------- | ------------------- |
| `auth/popup-closed-by-user`                     | Usuario cerró popup  | No mostrar error    |
| `auth/account-exists-with-different-credential` | Email ya registrado  | Ofrecer vincular    |
| `auth/credential-already-in-use`                | GitHub ya vinculado  | Informar al usuario |
| `auth/operation-not-allowed`                    | GitHub no habilitado | Activar en Firebase |

---

## Consideraciones Especiales

### Problema del email privado

**Situación:** GitHub permite que los usuarios mantengan su email privado.

**Impacto:** `user.email` puede ser `null` incluso con el scope `user:email`.

**Solución implementada:**

```javascript
if (!user.email) {
  // Solicitar email manualmente con SweetAlert2
  const { value: email } = await Swal.fire({
    title: "Email requerido",
    input: "email",
    inputPlaceholder: "tu@email.com",
  });

  if (email) {
    userEmail = email;
  } else {
    // Si cancela, cerrar sesión y abortar
    await auth.signOut();
    return;
  }
}
```

---

## Pruebas

### Checklist

- [ ] **Login con email público**

  - Usuario con email público inicia sesión
  - Email se guarda correctamente
  - Sesión se registra

- [ ] **Login con email privado**

  - Usuario con email privado ve solicitud manual
  - Puede ingresar email manualmente
  - Si cancela, sesión se cierra

- [ ] **Vincular desde perfil**

  - Login con otro método
  - Vincular GitHub desde perfil
  - Verificar registro de vinculación

- [ ] **Manejo de errores**
  - Cerrar popup antes de completar
  - Intentar con cuenta ya vinculada
  - Callback URL incorrecto

---

## 🔍 Troubleshooting

### Problema: Callback URL mismatch

**Síntoma:** Error al redirigir

**Solución:** Verifica que la URL sea exacta en ambos lados:

```
https://tu-proyecto.firebaseapp.com/__/auth/handler
```

- Sin espacios
- Debe incluir `https://`
- Debe terminar en `/__/auth/handler`

---

### Problema: Email siempre null

**Síntomas:** `user.email` siempre es `null`

**Causas:**

1. Usuario tiene email privado en GitHub
2. No se agregó el scope `user:email`

**Solución:**

```javascript
// Verificar que esté el scope
githubProvider.addScope("user:email");

// Manejar caso de email privado
if (!user.email) {
  // Solicitar manualmente
}
```

---

### Problema: Popup no se abre

**Síntomas:** Click no hace nada

**Causas:**

1. Navegador bloqueando popups
2. Extensiones interfiriendo

**Solución:**

```javascript
if (error.code === "auth/popup-blocked") {
  alert("Por favor permite los popups para este sitio");
}
```

---

## Notas adicionales

### Scopes de GitHub

Por defecto:

- `read:user`: Información básica del perfil

Requerido:

- `user:email`: Email del usuario

Opcionales (necesitan aprobación):

- `repo`: Acceso a repositorios
- `user:follow`: Ver seguidores

### Múltiples cuentas

Si un usuario tiene varias cuentas de GitHub, la configuración `prompt: 'select_account'` fuerza la selección de cuenta.

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Autor:** Learn Flow Team
