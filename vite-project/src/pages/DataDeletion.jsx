import React from 'react';
import { Mail } from 'lucide-react';

const DataDeletion = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Eliminación de Datos de Usuario</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          En ArchitecturaOS respetamos tu privacidad y tu derecho a eliminar tus datos.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-6 mb-4">¿Qué datos se eliminan?</h2>
      <ul className="list-disc ml-6 mb-6 space-y-2">
        <li>Tu información de perfil (nombre, email, foto)</li>
        <li>Tu historial de progreso y lecciones</li>
        <li>Tus preferencias y configuraciones</li>
        <li>Cualquier contenido que hayas creado</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-4">Cómo solicitar la eliminación de tus datos</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-3">Método 1: Desde la aplicación</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Inicia sesión en tu cuenta</li>
          <li>Ve a <strong>Configuración → Mi Cuenta</strong></li>
          <li>Desplázate hasta <strong>"Eliminar mi cuenta"</strong></li>
          <li>Confirma la eliminación</li>
        </ol>
        <p className="mt-3 text-sm text-gray-600">
          ⏱️ Tus datos serán eliminados inmediatamente y de forma permanente.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-3">Método 2: Por correo electrónico</h3>
        <p className="mb-3">Si no puedes acceder a tu cuenta, contáctanos:</p>
        <div className="flex items-center gap-2 bg-white p-4 rounded border">
          <Mail className="w-5 h-5 text-purple-600" />
          <a href="mailto:daniloww27@gmail.com" className="text-purple-600 hover:underline">
            daniloww27@gmail.com
          </a>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Incluye en tu mensaje:
        </p>
        <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
          <li>Tu correo electrónico registrado</li>
          <li>Asunto: "Solicitud de eliminación de datos"</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          ⏱️ Procesaremos tu solicitud en un plazo de 30 días.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Datos que permanecen</h2>
      <p className="mb-3">Por razones legales y de seguridad, podemos retener:</p>
      <ul className="list-disc ml-6 mb-6 space-y-2 text-gray-700">
        <li>Registros de transacciones (si aplica)</li>
        <li>Información requerida por ley durante el período de retención legal</li>
        <li>Datos anonimizados para análisis estadísticos</li>
      </ul>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <p className="text-yellow-800">
          <strong>⚠️ Advertencia:</strong> La eliminación de datos es permanente e irreversible. 
          No podremos recuperar tu cuenta ni tu progreso después de la eliminación.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Preguntas frecuentes</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">¿Cuánto tiempo toma eliminar mis datos?</h3>
          <p className="text-gray-700">
            Si lo haces desde la aplicación, es inmediato. Por correo, hasta 30 días.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">¿Puedo recuperar mi cuenta después?</h3>
          <p className="text-gray-700">
            No. La eliminación es permanente. Deberás crear una nueva cuenta si deseas volver.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">¿Se eliminarán mis datos de Facebook?</h3>
          <p className="text-gray-700">
            Esta acción solo elimina datos de ArchitecturaOS. Para eliminar datos de Facebook, 
            debes hacerlo desde tu cuenta de Facebook.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">¿Necesitas ayuda?</h3>
        <p className="text-gray-700">
          Contáctanos en: <a href="mailto:daniloww27@gmail.com" className="text-purple-600 hover:underline">daniloww27@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default DataDeletion;