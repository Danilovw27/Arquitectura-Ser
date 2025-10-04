import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, BookOpen, Star, Users, User, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validaciones
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Swal.fire("Error", "Todos los campos son obligatorios", "error");
    }

    if (password.length < 6) {
      return Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }
    
    setLoading(true);
    
    try {
      const emailLower = email.toLowerCase();

      // Crea usuario para el servicio de autenticación de Firebase
      const userMethod = await createUserWithEmailAndPassword(auth, emailLower, password);
      const user = userMethod.user;

      // Guardar datos en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: emailLower,
        estado: "activo",
        rol: "usuario",
        creado: new Date(),
        metodo: "password"
      });

      Swal.fire("¡Éxito!", "Cuenta creada exitosamente", "success");
      
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirigir al login o dashboard
      navigate("/login");
      
    } catch (error) {
      console.error('Error completo en registro:', error);
      console.error('Código del error:', error.code);
      console.error('Mensaje del error:', error.message);
      
      if (error.code === "auth/email-already-in-use") {
        Swal.fire("Error", "Este correo electrónico ya está registrado", "error");
      } else if (error.code === "auth/weak-password") {
        Swal.fire("Error", "La contraseña es muy débil", "error");
      } else if (error.code === "auth/invalid-email") {
        Swal.fire("Error", "Correo electrónico inválido", "error");
      } else if (error.code === "auth/operation-not-allowed") {
        Swal.fire("Error", "El registro con email/contraseña no está habilitado", "error");
      } else if (error.code === "auth/network-request-failed") {
        Swal.fire("Error", "Error de conexión. Verifica tu internet", "error");
      } else {
        Swal.fire({
          title: "Error en registro",
          text: `Código: ${error.code}\nMensaje: ${error.message}`,
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex overflow-y-auto ">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-40 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
      </div>

      <div className="relative mx-auto w-full flex bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-purple-600 to-pink-500 p-12 flex-col justify-center items-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-pink-500/90"></div>
          
          {/* Character illustration */}
          <div className="relative text-center">
            <div className="w-48 h-48 mx-auto mb-8 relative">
              <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-8xl">🚀</div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Join Learn Flow</h1>
            <p className="text-white/90 text-lg mb-8">Start your English learning journey today</p>
            
            <div className="space-y-4 text-white/80">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                <span>AI-Powered Learning</span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-6 h-6 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 right-16 w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-32 left-16 w-8 h-8 bg-white/15 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-white/25 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2 text-purple-600 mb-4">
                <Globe className="w-8 h-8" />
                <span className="text-2xl font-bold">Learn Flow</span>
              </div>
              <p className="text-gray-600">Start your English learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className='register-form'>
              <div className="space-y-6">
                {/* Name Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="First name"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Last name"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Create password (min. 6 characters)"
                      required
                      minLength="6"
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

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Toggle to Login */}
            <div className="mt-8 text-center">
              <span className="text-gray-600">
                Already have an account?{' '}
              </span>
              <a
                href="/Dashboard"
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;