import React, { useState } from 'react';
import { Mail, ArrowLeft, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      // AQUÍ INTEGRARÁS CON FIREBASE
      // Importa: import { sendPasswordResetEmail } from 'firebase/auth';
      // import { auth } from '../firebase';
      // 
      // await sendPasswordResetEmail(auth, email);
      
      // Simulación (eliminar cuando integres Firebase)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      console.log('Email de recuperación enviado a:', email);
    } catch (error) {
      console.error('Error:', error);
      
      // Manejo de errores de Firebase
      if (error.code === 'auth/user-not-found') {
        alert('No existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/invalid-email') {
        alert('Correo electrónico inválido');
      } else {
        alert('Error al enviar el correo. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (emailSent) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Correo Enviado!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a:
            </p>
            
            <p className="text-lg font-semibold text-gray-800 mb-6">
              {email}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Instrucciones:</strong>
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Revisa tu bandeja de entrada</li>
                <li>Haz clic en el enlace del correo</li>
                <li>Crea tu nueva contraseña</li>
                <li>Inicia sesión con tu nueva contraseña</li>
              </ol>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              ¿No recibes el correo? Revisa tu carpeta de spam o correo no deseado.
            </p>
            
            <button
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-2/3 ">
        
        {/* Botón de volver */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Icono */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          
          <p className="text-gray-600">
            No te preocupes, te enviaremos un enlace para recuperarla
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full pl-11 text-black pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Regresar al inicio de sesión
            </button>
          </div>
        </div>

        {/* Nota de seguridad */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Por seguridad, el enlace de recuperación expirará en 1 hora.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;