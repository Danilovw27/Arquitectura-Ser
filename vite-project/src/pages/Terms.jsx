import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Términos del Servicio</h1>
      
      <h2 className="text-2xl font-bold mt-6 mb-3">Aceptación de los términos</h2>
      <p className="mb-4">
        Al acceder y usar ArchitecturaOS, aceptas estar sujeto a estos términos.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-3">Uso del servicio</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Debes ser mayor de 13 años para usar este servicio</li>
        <li>Eres responsable de mantener la seguridad de tu cuenta</li>
        <li>No puedes usar el servicio para fines ilegales</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">Propiedad intelectual</h2>
      <p className="mb-4">
        Todo el contenido de la plataforma es propiedad de ArchitecturaOS.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-3">Contacto</h2>
      <p>Para preguntas: daniloww27@gmail.com</p>
    </div>
  );
};

export default Terms;