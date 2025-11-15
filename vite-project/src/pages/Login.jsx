import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, BookOpen, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, GoogleProvider, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // ADMINISTRAR PERSISTENCIA SEGÚN REMEMBER ME
  React.useEffect(() => {
    auth.setPersistence(
      rememberMe ?
        'local' :
        'session'
    );
  }, [rememberMe]);

  // CREAR O ACTUALIZAR USUARIO EN FIRESTORE
  const createOrUpdateUser = async (user, providerId, additionalData = {}) => {
    const userRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(userRef);

    const baseData = {
      uid: user.uid,
      email: (user.email || '').toLowerCase(),
      displayName: user.displayName || '',
      firstName: user.displayName?.split(' ')[0] || 'Usuario',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      photoURL: user.photoURL || '',
      estado: "activo",
      rol: "usuario",
      ultimoAcceso: new Date(),
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...baseData,
        creado: new Date(),
        proveedores: [providerId],
        ...(providerId === 'github.com' && {
          githubUsername: additionalData.username || ''
        })
      });
    } else {
      const existingData = userDoc.data();
      let updatedProveedores = Array.isArray(existingData.proveedores) ? [...existingData.proveedores] : [];
      // Asegura que el proveedor está en el array solo una vez
      if (!updatedProveedores.includes(providerId)) {
        updatedProveedores.push(providerId);
      }

      const updateData = {
        ...baseData,
        ultimoAcceso: new Date(),
        photoURL: user.photoURL || existingData.photoURL,
        proveedores: updatedProveedores,
      };

      if (providerId === 'github.com' && additionalData.username) {
        updateData.githubUsername = additionalData.username;
      }

      await updateDoc(userRef, updateData);
    }
  };

  // MANEJO DE ERROR DE CUENTA EXISTENTE
  const handleExistingAccount = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        return false;
      }
      setEmail(email);
      let methodName = '';
      // Traduce el método original para mostrar un mensaje (opcional)
      switch (methods[0]) {
        case 'password':
          methodName = "email y contraseña";
          break;
        case 'google.com':
          methodName = "Google";
          break;
        case 'facebook.com':
          methodName = "Facebook";
          break;
        case 'github.com':
          methodName = "GitHub";
          break;
        default:
          methodName = methods[0];
      }
      await Swal.fire(
        "Cuenta existente",
        `Ya existe una cuenta registrada con este correo usando el método ${methodName}. Por favor usa ese método para ingresar.`,
        "info"
      );
      return true;
    } catch (error) {
      console.error('Error al manejar cuenta existente:', error);
      return false;
    }
  };

  // LOGIN SOCIAL
  const handleSocialLogin = async (ProviderClass, providerOverride = null) => {
    setLoading(true);
    const provider = providerOverride || new ProviderClass();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const providerId = result.providerId || provider.providerId || providerOverride?.providerId;
      const providerData = providerId === 'github.com'
        ? { username: user.reloadUserInfo?.screenName || '' }
        : {};

      await createOrUpdateUser(user, providerId, providerData);

      await Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setEmail(''); setPassword('');
      navigate('/dashboard');
    } catch (error) {
      console.error(`Error en login social:`, error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        if (email) {
          await handleExistingAccount(email);
        }
      } else {
        let message = `Error al iniciar sesión`;
        switch (error.code) {
          case 'auth/popup-blocked':
            message = "El popup fue bloqueado. Por favor, permite popups para este sitio.";
            break;
          case 'auth/network-request-failed':
            message = "Error de conexión. Verifica tu internet.";
            break;
          default:
            message = error.message || message;
        }
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          Swal.fire("Error", message, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // LOGIN CON EMAIL/PASSWORD
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire("Error", "Completa todos los campos", "error");
    }
    setLoading(true);
    try {
      const emailLower = email.toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
      const user = userCredential.user;

      await createOrUpdateUser(user, "password");

      await Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      setEmail(''); setPassword('');
      navigate('/dashboard');
    } catch (error) {
      let msg = "Error al iniciar sesión";
      switch (error.code) {
        case "auth/user-not-found": msg = "No existe una cuenta con este correo electrónico"; break;
        case "auth/wrong-password": msg = "Contraseña incorrecta"; break;
        case "auth/invalid-email": msg = "Correo electrónico inválido"; break;
        case "auth/user-disabled": msg = "Esta cuenta ha sido deshabilitada"; break;
        case "auth/too-many-requests": msg = "Demasiados intentos fallidos. Intenta más tarde"; break;
        case "auth/invalid-credential": msg = "Credenciales inválidas. Verifica tu email y contraseña"; break;
        default: msg = error.message;
      }
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS ESPECÍFICOS
  const handleGoogleLogin = async () => {
    await handleSocialLogin(GoogleAuthProvider, GoogleProvider);
  };
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    await handleSocialLogin(FacebookAuthProvider, provider);
  };
  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    provider.addScope('read:user');
    await handleSocialLogin(GithubAuthProvider, provider);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex overflow-y-auto">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-40 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
      </div>

      <div className="relative mx-auto w-full flex bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 p-12 flex-col justify-center items-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-pink-500/90"></div>
          
          {/* Character illustration */}
          <div className="relative z-10 text-center">
            <div className="w-48 h-48 mx-auto mb-8 relative">
              <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-8xl">🎓</div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">Learn Flow</h1>
            <p className="text-white/90 text-lg mb-8">Master English with AI-powered learning</p>
            
            <div className="space-y-4 text-white/80">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Interactive Lessons</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                <span>Personalized Progress</span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-6 h-6 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 right-16 w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-32 left-16 w-8 h-8 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-white/25 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2 text-purple-600 mb-4">
                <Globe className="w-8 h-8" />
                <span className="text-2xl font-bold">Learn Flow</span>
              </div>
              <p className="text-gray-600">Master English with AI-powered learning</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/ForgotPassword"
                  className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Continuar con Google"
                >
                  {/* SVG de Google */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button 
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Continuar con Facebook"
                >
                  <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                  title="Continuar con GitHub"
                >
                  <svg className="w-5 h-5" fill="#181717" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Toggle Login/Register */}
            <div className="mt-8 text-center">
              <span className="text-gray-600">
                Don't have an account?{' '}
              </span>
              <Link 
                to="/register"
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
