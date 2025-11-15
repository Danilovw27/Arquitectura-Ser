import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Política de Privacidad</h1>
      <p className="mb-4">
        En ArchitecturaOS, respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
      </p>
      
      <h2 className="text-2xl font-bold mt-6 mb-3">Información que recopilamos</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Nombre y correo electrónico (al registrarte)</li>
        <li>Información de perfil de redes sociales (si usas login social)</li>
        <li>Datos de uso de la aplicación</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">Cómo usamos tu información</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Proporcionar y mejorar nuestros servicios</li>
        <li>Personalizar tu experiencia de aprendizaje</li>
        <li>Comunicarnos contigo sobre actualizaciones</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">Contacto</h2>
      <p>Para preguntas sobre esta política: daniloww27@gmail.com</p>
    </div>
  );
};

export default Privacy;