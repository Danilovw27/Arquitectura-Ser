import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  GoogleProvider, 
  providerFacebook, 
  providerGitHub
} from '../firebase';
import { 
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

  // Función para registrar sesión al vincular
  const registerLinkSession = async (user, providerId, providerName) => {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const sessionData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || 'Sin nombre',
        photoURL: user.photoURL || null,
        provider: providerId,
        loginTime: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isLinkAction: true, // Marca que fue una vinculación
      };

      await addDoc(collection(db, 'session_logs'), sessionData);
      console.log(`Sesión de vinculación registrada: ${providerName}`);
    } catch (error) {
      console.error('Error al registrar sesión de vinculación:', error);
    }
  };

  // Configuración específica para Google
  const handleGoogleLink = async () => {
    setLinking(true);
    try {
      const result = await linkWithPopup(auth.currentUser, GoogleProvider);
      
      // Actualizar Firestore
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
        providers: arrayUnion('google.com'),
        updatedAt: new Date(),
      });

      // REGISTRAR la sesión de vinculación
      await registerLinkSession(result.user, 'google.com', 'Google');

      setProviders(prev => [...new Set([...prev, 'google.com'])]);
      Swal.fire('✅ Vinculado', 'Google vinculado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error linking Google:', error);
      if (error.code === 'auth/provider-already-linked') {
        Swal.fire('ℹ️', 'Google ya está vinculado a tu cuenta', 'info');
        setProviders(prev => [...new Set([...prev, 'google.com'])]);
      } else if (error.code === 'auth/credential-already-in-use') {
        Swal.fire('❌ Error', 'Estas credenciales de Google ya están en uso con otra cuenta', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Usuario cerró el popup, no hacer nada
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

      // REGISTRAR la sesión de vinculación
      await registerLinkSession(result.user, 'facebook.com', 'Facebook');

      setProviders(prev => [...new Set([...prev, 'facebook.com'])]);
      Swal.fire('✅ Vinculado', 'Facebook vinculado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error linking Facebook:', error);
      if (error.code === 'auth/provider-already-linked') {
        Swal.fire('ℹ️', 'Facebook ya está vinculado a tu cuenta', 'info');
        setProviders(prev => [...new Set([...prev, 'facebook.com'])]);
      } else if (error.code === 'auth/credential-already-in-use') {
        Swal.fire('❌ Error', 'Estas credenciales de Facebook ya están en uso con otra cuenta', 'error');
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
      // Verificar que el usuario esté autenticado
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      // Crear provider de GitHub con configuración para obtener email
      const githubProvider = new GithubAuthProvider();
      githubProvider.addScope('user:email');
      githubProvider.setCustomParameters({ 
        allow_signup: 'false',
        prompt: 'consent',
        login: auth.currentUser.email
      });

      const result = await linkWithPopup(auth.currentUser, githubProvider);
      
      // Obtener el usuario actualizado
      const updatedUser = result.user;
      
      // Verificar y actualizar el email si es necesario
      let finalEmail = updatedUser.email || auth.currentUser.email;

      // Actualizar Firestore con el proveedor vinculado
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
        providers: arrayUnion('github.com'),
        email: finalEmail,
        updatedAt: new Date(),
      });

      // REGISTRAR la sesión de vinculación
      await registerLinkSession(updatedUser, 'github.com', 'GitHub');

      // Actualizar estado local
      setProviders(prev => [...new Set([...prev, 'github.com'])]);
      
      Swal.fire({
        icon: 'success',
        title: '✅ Vinculado',
        text: `GitHub vinculado exitosamente a ${finalEmail}`,
        timer: 3000
      });

    } catch (error) {
      console.error('Error linking GitHub:', error);
      
      if (error.code === 'auth/provider-already-linked') {
        Swal.fire('ℹ️', 'GitHub ya está vinculado a tu cuenta', 'info');
        setProviders(prev => [...new Set([...prev, 'github.com'])]);
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 overflow-y-auto p-4">
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
              <strong>Nombre:</strong> {userData?.displayName || userData?.firstName || 'No especificado'} {userData?.lastName || ''}
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
                action: handleGoogleLink
              },
              { 
                id: 'facebook.com', 
                name: 'Facebook', 
                icon: <Facebook className="w-5 h-5" />, 
                color: 'hover:bg-blue-50 border-blue-200',
                action: handleFacebookLink
              },
              { 
                id: 'github.com', 
                name: 'GitHub', 
                icon: <Github className="w-5 h-5" />, 
                color: 'hover:bg-gray-50 border-gray-200',
                action: handleGithubLink
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
                    ✓ Vinculado
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
          <ul className="text-purple-700 text-sm space-y-1">
            <li>• Al vincular un proveedor, se registrará en el historial de sesiones</li>
            <li>• Podrás iniciar sesión con cualquier proveedor vinculado</li>
            <li>• Todos los proveedores comparten el mismo perfil y progreso</li>
            <li>• El historial muestra cada vinculación y cada inicio de sesión</li>
          </ul>
        </div>

        {/* Botón volver */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-white/50 hover:bg-white/70 text-purple-800 font-semibold px-6 py-2 rounded-xl transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;