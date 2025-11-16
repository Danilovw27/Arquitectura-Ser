# Autenticación con Facebook - Learn Flow

## Descripción

La autenticación con Facebook permite a los usuarios iniciar sesión en Learn Flow utilizando sus cuentas de Facebook. Este método ofrece:

- ✅ Acceso rápido sin crear nueva contraseña
- ✅ Sincronización de foto de perfil y nombre
- ✅ Gran base de usuarios con cuentas existentes
- ✅ Posibilidad de vincular con otros métodos

---

## 🔧 Requisitos Previos

1. **Cuenta de Facebook** (personal o de desarrollador)
2. **Proyecto en Firebase** configurado
3. **Meta for Developers Account** ([developers.facebook.com](https://developers.facebook.com))
4. **Dependencias instaladas:**
   ```bash
   npm install firebase
   ```

---

## Configuración en Meta for Developers

### Paso 1: Crear aplicación en Facebook

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Haz clic en **My Apps** > **Create App**
3. Selecciona **Consumer** (para apps que necesitan login)
4. **App Display Name:** "Learn Flow"
5. **App Contact Email:** Tu email de contacto
6. Haz clic en **Create App**

---

### Paso 2: Agregar Facebook Login

1. En el Dashboard, busca **Facebook Login**
2. Haz clic en **Set Up**
3. Selecciona **Web** como plataforma

---

### Paso 3: Obtener credenciales

1. Ve a **Settings** > **Basic**
2. Copia tu **App ID**
3. Haz clic en **Show** para ver tu **App Secret**
4. Guarda ambos valores de forma segura

**Importante:** Nunca compartas tu App Secret públicamente.

---

### Paso 4: Configurar URLs de redirección

Más adelante obtendrás una URL de Firebase que deberás pegar en:

- **Facebook Login** > **Settings** > **Valid OAuth Redirect URIs**

---

## Configuración en Firebase Console

### Paso 1: Habilitar Facebook

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. **Authentication** > **Sign-in method**
4. Busca **Facebook** y haz clic

---

### Paso 2: Agregar credenciales

1. Activa el interruptor **Enable**
2. Pega tu **App ID** de Facebook
3. Pega tu **App Secret** de Facebook
4. **COPIA** la **OAuth redirect URI** que Firebase te proporciona
5. Haz clic en **Save**

La URL será algo como:

```
https://arquitecturaos.firebaseapp.com/__/auth/handler
```

---

### Paso 3: Actualizar Facebook con la URL

1. Regresa a Facebook Developers > Tu App > Facebook Login > Settings
2. Pega la URL de Firebase en **Valid OAuth Redirect URIs**
3. **Save Changes**

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

// Configurar proveedor de Facebook
export const FacebookProvider = new FacebookAuthProvider();
FacebookProvider.setCustomParameters({
  auth_type: "reauthenticate",
  display: "popup",
});
```

---

## Implementación del Código

### 1. Login con Facebook - `Login.jsx`

```javascript
import React, { useState } from "react";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { auth, FacebookProvider, db } from "../firebase";
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
        displayName: user.displayName,
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
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: provider.providerId,
      loginTime: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
  };

  // Handler para login con Facebook
  const handleFacebookLogin = async () => {
    setLoading(true);

    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.setCustomParameters({
      auth_type: "reauthenticate",
      display: "popup",
    });

    try {
      // 1. Autenticar con Facebook
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // 2. Guardar usuario
      await saveUserToFirestore(user, user.providerData[0]);

      // 3. Registrar sesión
      await registerSessionLog(user, user.providerData[0]);

      // 4. Éxito
      Swal.fire("¡Bienvenido!", "Has iniciado sesión con Facebook", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login con Facebook:", error);

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
      onClick={handleFacebookLogin}
      disabled={loading}
      className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
        {/* SVG de Facebook */}
      </svg>
    </button>
  );
};
```

---

### 2. Vincular Facebook desde Perfil - `Profile.jsx`

```javascript
import { linkWithPopup, FacebookAuthProvider } from "firebase/auth";
import { FacebookProvider } from "../firebase";

const handleFacebookLink = async () => {
  setLinking(true);
  try {
    const result = await linkWithPopup(auth.currentUser, FacebookProvider);

    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
      providers: arrayUnion("facebook.com"),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "session_logs"), {
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL,
      provider: "facebook.com",
      loginTime: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isLinkAction: true,
    });

    Swal.fire("✅ Vinculado", "Facebook vinculado exitosamente", "success");
  } catch (error) {
    if (error.code === "auth/credential-already-in-use") {
      Swal.fire("❌ Error", "Esta cuenta de Facebook ya está en uso", "error");
    }
  } finally {
    setLinking(false);
  }
};
```

---

## 🔄 Flujo de Autenticación

1. **Click en botón Facebook** → Se abre popup de Facebook
2. **Usuario se autentica** → Ingresa credenciales si es necesario
3. **Acepta permisos** → Permite compartir datos básicos
4. **Firebase recibe token** → Valida credenciales
5. **Se guarda en Firestore** → Crea/actualiza documento en `usuarios`
6. **Se registra sesión** → Crea entrada en `session_logs`
7. **Redirección** → Usuario va al Dashboard

---

## Manejo de Errores

### Errores comunes

| Código                                          | Descripción            | Solución            |
| ----------------------------------------------- | ---------------------- | ------------------- |
| `auth/popup-closed-by-user`                     | Usuario cerró popup    | No mostrar error    |
| `auth/account-exists-with-different-credential` | Email ya registrado    | Ofrecer vincular    |
| `auth/credential-already-in-use`                | Facebook ya vinculado  | Informar al usuario |
| `auth/operation-not-allowed`                    | Facebook no habilitado | Activar en Firebase |

---

## 🧪 Pruebas

### Checklist

- [ ] **Login con cuenta nueva**

  - Verificar creación en Firebase Authentication
  - Verificar documento en Firestore
  - Verificar entrada en session_logs

- [ ] **Login con cuenta existente**

  - Verificar actualización de lastLogin
  - Verificar nueva entrada en session_logs

- [ ] **Vincular desde perfil**

  - Login con otro método
  - Vincular Facebook desde perfil
  - Verificar registro de vinculación

- [ ] **Manejo de errores**
  - Cerrar popup antes de completar
  - Intentar con cuenta ya vinculada
  - Probar con popups bloqueados

---

## 🔍 Troubleshooting

### Problema: URL Mismatch

**Síntoma:** Error al redirigir

**Solución:** Verifica que la URL en Facebook sea exactamente la misma que te dio Firebase:

```
https://tu-proyecto.firebaseapp.com/__/auth/handler
```

---

### Problema: No se recibe email

**Síntoma:** `user.email` es `null`

**Causa:** Usuario no tiene email o no lo compartió

**Solución:**

```javascript
if (!user.email) {
  const { value: email } = await Swal.fire({
    title: "Email requerido",
    input: "email",
    inputPlaceholder: "tu@email.com",
  });

  if (email) {
    // Actualizar con email manual
  }
}
```

---

### Problema: Solo funciona con usuarios de prueba

**Síntoma:** Otros usuarios no pueden hacer login

**Causa:** App en modo Development

**Solución:**

1. Completa la información de la app en Facebook
2. Agrega Privacy Policy URL
3. Sube iconos (1024x1024)
4. Cambia a **Live Mode**

---

## Notas adicionales

### Permisos

Por defecto Facebook proporciona:

- `public_profile`: Nombre, foto, ID
- `email`: Correo electrónico

Si necesitas más datos, debes solicitarlos y obtener aprobación de Facebook.

### Modo Development vs Live

**Development:** Solo funciona con testers agregados manualmente
**Live:** Disponible para todos los usuarios de Facebook

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Autor:** Learn Flow Team
