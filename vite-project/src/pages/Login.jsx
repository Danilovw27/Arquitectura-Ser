import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, BookOpen, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { auth, GoogleProvider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return Swal.fire("Error", "Por favor completa todos los campos", "error");
    }

    setLoading(true);
    
    try {
      const emailLower = email.toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
      const user = userCredential.user;

      // Verificar si el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      
      if (!userDoc.exists()) {
        // Si no existe, crear el documento básico
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: emailLower,
          estado: "activo",
          rol: "usuario",
          creado: new Date(),
          metodo: "password"
        });
      }

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      // Redirigir al dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = "Error al iniciar sesión";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este correo electrónico";
          break;
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta";
          break;
        case "auth/invalid-email":
          errorMessage = "Correo electrónico inválido";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta cuenta ha sido deshabilitada";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifica tu internet";
          break;
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas. Verifica tu email y contraseña";
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, GoogleProvider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      
      if (!userDoc.exists()) {
        // Si es la primera vez que inicia sesión con Google, crear el documento
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL || '',
          estado: "activo",
          rol: "usuario",
          creado: new Date(),
          metodo: "google"
        });
      }

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión con Google exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error en login con Google:', error);
      
      let errorMessage = "Error al iniciar sesión con Google";
      
      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Iniciado sesión cancelado";
          break;
        case "auth/popup-blocked":
          errorMessage = "El popup fue bloqueado por el navegador";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Solicitud cancelada";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifica tu internet";
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        Swal.fire("Error", errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    
    try {
      const facebookProvider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      
      if (!userDoc.exists()) {
        // Si es la primera vez que inicia sesión con Facebook, crear el documento
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL || '',
          estado: "activo",
          rol: "usuario",
          creado: new Date(),
          metodo: "facebook"
        });
      }

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión con Facebook exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error en login con Facebook:', error);
      
      let errorMessage = "Error al iniciar sesión con Facebook";
      
      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Iniciado sesión cancelado";
          break;
        case "auth/popup-blocked":
          errorMessage = "El popup fue bloqueado por el navegador";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage = "Ya existe una cuenta con este correo usando otro método";
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      if (error.code !== "auth/popup-closed-by-user") {
        Swal.fire("Error", errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
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

      <div className="relative mx-auto w-full  flex bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
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

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2 text-gray-700">Google</span>
                </button>
                <button 
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2 text-gray-700">Facebook</span>
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