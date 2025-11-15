import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  GoogleProvider, 
  providerFacebook, 
  providerGitHub  // ← SOLO este para GitHub
} from '../firebase';
import { 
  signInWithPopup, 
  linkWithCredential, 
  GoogleAuthProvider,
  FacebookAuthProvider, 
  GithubAuthProvider,
  linkWithPopup,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import Swal from 'sweetalert2';
import {
  User,
  LogOut,
  Link2,
  Mail,
  Chrome as Google,
  Facebook,
  Github,
} from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');
      
      try {
        const docSnap = await getDoc(doc(db, 'usuarios', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
        
        // Obtener proveedores del usuario actual
        setProviders(user.providerData.map((p) => p.providerId));
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Función genérica para vincular proveedores
  const handleLinkProvider = async (provider, providerName, providerId) => {
    setLinking(true);
    try {
      // 1. Iniciar sesión con el proveedor mediante popup
      const result = await signInWithPopup(auth, provider);
      const credential = 
        providerId === 'google.com' ? GoogleAuthProvider.credentialFromResult(result) :
        providerId === 'facebook.com' ? FacebookAuthProvider.credentialFromResult(result) :
        GithubAuthProvider.credentialFromResult(result);

      // 2. Vincular el proveedor al usuario actual
      await linkWithCredential(auth.currentUser, credential);

      // 3. Actualizar Firestore
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
        providers: arrayUnion(providerId),
        updatedAt: new Date(),
      });

      // 4. Actualizar estado local
      setProviders(prev => [...prev, providerId]);
      
      Swal.fire('✅ Vinculado', `${providerName} vinculado exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error linking provider:', error);
      
      if (error.code === 'auth/provider-already-linked') {
        Swal.fire('ℹ️', `${providerName} ya está vinculado a tu cuenta`, 'info');
        // Actualizar estado local si ya está vinculado
        setProviders(prev => [...prev, providerId]);
      } else if (error.code === 'auth/credential-already-in-use') {
        Swal.fire('❌ Error', 'Estas credenciales ya están en uso con otra cuenta', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Usuario cerró el popup, no hacer nada
      } else {
        Swal.fire('❌ Error', error.message, 'error');
      }
    } finally {
      setLinking(false);
    }
  };

  // Configuración específica para GitHub
  const handleGithubLink = async () => {
  setLinking(true);
  try {
    // 1. Verificar que el usuario esté autenticado con el método principal (email/password)
    if (!auth.currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    // 2. Crear provider de GitHub con configuración para obtener email
    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');
    githubProvider.setCustomParameters({ 
      allow_signup: 'false',
      prompt: 'consent',
      login: auth.currentUser.email // Forzar el email del usuario actual
    });

    // 3. Vincular usando linkWithPopup (NO signInWithPopup)
    const result = await linkWithPopup(auth.currentUser, githubProvider);
    
    // 4. Obtener el usuario actualizado
    const updatedUser = result.user;
    
    // 5. Verificar y actualizar el email si es necesario
    let finalEmail = updatedUser.email;
    
    // Si GitHub no devolvió el email, usar el email actual del usuario
    if (!finalEmail) {
      finalEmail = auth.currentUser.email;
      console.log('GitHub no proporcionó email, usando email actual:', finalEmail);
    }

    // 6. Actualizar Firestore con el proveedor vinculado
    await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
      providers: arrayUnion('github.com'),
      email: finalEmail, // Asegurar el email correcto
      updatedAt: new Date(),
    });

    // 7. Actualizar estado local
    setProviders(prev => {
      const newProviders = [...prev, 'github.com'];
      return [...new Set(newProviders)]; // Eliminar duplicados
    });
    
    Swal.fire({
      icon: 'success',
      title: '✅ Vinculado',
      text: `GitHub vinculado exitosamente a ${finalEmail}`,
      timer: 3000
    });

  } catch (error) {
    console.error('Error detallado linking GitHub:', error);
    
    if (error.code === 'auth/provider-already-linked') {
      Swal.fire('ℹ️', 'GitHub ya está vinculado a tu cuenta', 'info');
      // Actualizar estado local
      setProviders(prev => [...prev, 'github.com']);
    } else if (error.code === 'auth/email-already-in-use') {
      Swal.fire({
        icon: 'error',
        title: 'Email en uso',
        text: 'Este email de GitHub ya está asociado a otra cuenta. No se puede vincular.',
      });
    } else if (error.code === 'auth/credential-already-in-use') {
      Swal.fire('❌ Error', 'Estas credenciales de GitHub ya están en uso con otra cuenta', 'error');
    } else if (error.code === 'auth/popup-closed-by-user') {
      // Usuario cerró el popup, no hacer nada
    } else if (error.code === 'auth/requires-recent-login') {
      Swal.fire({
        icon: 'warning',
        title: 'Reautenticación requerida',
        text: 'Por favor inicia sesión nuevamente para vincular GitHub',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al vincular GitHub',
      });
    }
  } finally {
    setLinking(false);
  }
};

  // Configuración específica para Facebook
  const handleGoogleLink = async () => {
  setLinking(true);
  try {
    const result = await linkWithPopup(auth.currentUser, GoogleProvider);
    
    await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
      providers: arrayUnion('google.com'),
      updatedAt: new Date(),
    });

    setProviders(prev => [...prev, 'google.com']);
    Swal.fire('✅ Vinculado', 'Google vinculado exitosamente', 'success');
    
  } catch (error) {
    // Manejo de errores similar a GitHub
    if (error.code === 'auth/provider-already-linked') {
      Swal.fire('ℹ️', 'Google ya está vinculado a tu cuenta', 'info');
      setProviders(prev => [...prev, 'google.com']);
    } else {
      Swal.fire('❌ Error', error.message, 'error');
    }
  } finally {
    setLinking(false);
  }
};

// Configuración específica para Facebook
const handleFacebookLink = async () => {
  setLinking(true);
  try {
    const result = await linkWithPopup(auth.currentUser, providerFacebook);
    
    await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
      providers: arrayUnion('facebook.com'),
      updatedAt: new Date(),
    });

    setProviders(prev => [...prev, 'facebook.com']);
    Swal.fire('✅ Vinculado', 'Facebook vinculado exitosamente', 'success');
    
  } catch (error) {
    if (error.code === 'auth/provider-already-linked') {
      Swal.fire('ℹ️', 'Facebook ya está vinculado a tu cuenta', 'info');
      setProviders(prev => [...prev, 'facebook.com']);
    } else {
      Swal.fire('❌ Error', error.message, 'error');
    }
  } finally {
    setLinking(false);
  }
};  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      Swal.fire('❌ Error', 'Error al cerrar sesión', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Cargando perfil...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl mt-10 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <User className="w-8 h-8" /> Mi Perfil
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </div>

        {/* Información del usuario */}
        <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3 text-lg text-gray-700">
            <Mail className="w-5 h-5" />
            <div>
              <strong>Email:</strong> {userData?.email || auth.currentUser?.email}
            </div>
          </div>
          <div className="flex items-center gap-3 text-lg text-gray-700">
            <User className="w-5 h-5" />
            <div>
              <strong>Nombre:</strong> {userData?.firstName || 'No especificado'} {userData?.lastName || ''}
            </div>
          </div>
        </div>

        {/* Proveedores vinculados */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Link2 className="w-6 h-6" /> Proveedores vinculados
          </h2>
          <div className="space-y-3">
            {[
              { 
                id: 'google.com', 
                name: 'Google', 
                icon: <Google className="w-5 h-5" />, 
                color: 'hover:bg-red-50 border-red-200',
                action: handleGoogleLink  // ← Función específica
              },
              { 
                id: 'facebook.com', 
                name: 'Facebook', 
                icon: <Facebook className="w-5 h-5" />, 
                color: 'hover:bg-blue-50 border-blue-200',
                action: handleFacebookLink  // ← Función específica
              },
              { 
                id: 'github.com', 
                name: 'GitHub', 
                icon: <Github className="w-5 h-5" />, 
                color: 'hover:bg-gray-50 border-gray-200',
                action: handleGithubLink  // ← Función específica
              },
            ].map((provider) => (
              <div 
                key={provider.id} 
                className={`flex items-center justify-between border-2 rounded-xl p-4 transition-all duration-200 ${provider.color}`}
              >
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <span className="font-medium text-gray-800">{provider.name}</span>
                </div>
                
                {providers.includes(provider.id) ? (
                  <span className="text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full text-sm">
                    Vinculado
                  </span>
                ) : (
                  <button 
                    onClick={provider.action}
                    disabled={linking}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {linking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Vinculando...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" /> Vincular
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-purple-800 mb-2">💡 Información importante</h3>
          <p className="text-purple-700 text-sm">
            Al vincular proveedores, podrás iniciar sesión con cualquiera de ellos usando el mismo email.
            Todos los proveedores vinculados compartirán el mismo perfil y progreso.
          </p>
        </div>

        {/* Botón volver */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-white font-semibold transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;