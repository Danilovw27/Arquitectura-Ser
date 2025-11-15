import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [oobCode, setOobCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);

  // Validación de fortaleza de contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  useEffect(() => {
    // Obtener el código de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    
    if (code) {
      setOobCode(code);
      validateResetCode(code);
    } else {
      setValidatingCode(false);
      setCodeValid(false);
    }
  }, []);

  useEffect(() => {
    // Calcular fortaleza de contraseña
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  }, [password]);

  const validateResetCode = async (code) => {
    try {
      // AQUÍ INTEGRARÁS CON FIREBASE
      // import { verifyPasswordResetCode } from 'firebase/auth';
      // import { auth } from '../firebase';
      // 
      // await verifyPasswordResetCode(auth, code);
      
      // Simulación (eliminar cuando integres Firebase)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeValid(true);
    } catch (error) {
      console.error('Error validando código:', error);
      setCodeValid(false);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!password.trim() || !confirmPassword.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const allStrengthChecks = Object.values(passwordStrength).every(v => v);
    if (!allStrengthChecks) {
      alert('La contraseña debe cumplir con todos los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      // AQUÍ INTEGRARÁS CON FIREBASE
      // import { confirmPasswordReset } from 'firebase/auth';
      // import { auth } from '../firebase';
      // 
      // await confirmPasswordReset(auth, oobCode, password);
      
      // Simulación (eliminar cuando integres Firebase)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResetSuccess(true);
      console.log('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      
      // Manejo de errores de Firebase
      if (error.code === 'auth/expired-action-code') {
        alert('El enlace ha expirado. Solicita uno nuevo.');
      } else if (error.code === 'auth/invalid-action-code') {
        alert('El enlace es inválido. Solicita uno nuevo.');
      } else if (error.code === 'auth/weak-password') {
        alert('La contraseña es muy débil. Usa una contraseña más segura.');
      } else {
        alert('Error al restablecer la contraseña. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/'; // O la ruta de tu login
  };

  // Estado de carga mientras valida el código
  if (validatingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Validando enlace...</h2>
          <p className="text-gray-600 mt-2">Por favor espera</p>
        </div>
      </div>
    );
  }

  // Código inválido o expirado
  if (!codeValid) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Enlace Inválido o Expirado
          </h2>
          
          <p className="text-gray-600 mb-6">
            El enlace de recuperación no es válido o ya ha sido utilizado.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/ForgotPassword'}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
            >
              Solicitar nuevo enlace
            </button>
            
            <button
              onClick={goToLogin}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Éxito al restablecer contraseña
  if (resetSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Contraseña Actualizada!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          
          <button
            onClick={goToLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Formulario para restablecer contraseña
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Icono */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Restablecer Contraseña
          </h1>
          
          <p className="text-gray-600">
            Crea una contraseña nueva y segura
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          
          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-11 text-black pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Requisitos de contraseña */}
          {password && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Requisitos de seguridad:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-sm ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.length ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {passwordStrength.length && <CheckCircle className="w-3 h-3" />}
                  </div>
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.uppercase ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {passwordStrength.uppercase && <CheckCircle className="w-3 h-3" />}
                  </div>
                  Una letra mayúscula
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.lowercase ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {passwordStrength.lowercase && <CheckCircle className="w-3 h-3" />}
                  </div>
                  Una letra minúscula
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.number ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {passwordStrength.number && <CheckCircle className="w-3 h-3" />}
                  </div>
                  Un número
                </div>
              </div>
            </div>
          )}

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full text-black pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || password !== confirmPassword || !Object.values(passwordStrength).every(v => v)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-black py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg  disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Actualizando...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>

          <div className="text-center">
            <button
              onClick={goToLogin}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;