import React, { useState } from 'react';
import { Users, BookOpen, Globe } from 'lucide-react';

const Dashboard = () => {
  const [hoveredModule, setHoveredModule] = useState(null);

  const handleModuleClick = (moduleType) => {
    console.log(`Clicked on ${moduleType} module`);
    // navigate(`/${moduleType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-40 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 text-white mb-4">
            <Globe className="w-10 h-10" />
            <span className="text-5xl font-bold">Learn Flow Dashboard</span>
          </div>
          <p className="text-white/90 text-xl">Gestiona tu plataforma de aprendizaje</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Usuarios Module */}
          <div
            className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 cursor-pointer transition-all duration-300 transform ${
              hoveredModule === 'usuarios' ? 'scale-105 bg-white/95' : 'hover:scale-102'
            } shadow-2xl`}
            onMouseEnter={() => setHoveredModule('usuarios')}
            onMouseLeave={() => setHoveredModule(null)}
            onClick={() => handleModuleClick('users')}
          >
            {/* Floating dots */}
            <div className="absolute top-6 right-6 w-3 h-3 bg-blue-400/40 rounded-full"></div>
            <div className="absolute top-12 right-12 w-2 h-2 bg-purple-400/30 rounded-full"></div>
            <div className="absolute bottom-8 left-8 w-4 h-4 bg-blue-300/20 rounded-full"></div>

            <div className="relative">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                hoveredModule === 'usuarios' ? 'rotate-3 scale-110' : ''
              }`}>
                <Users className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Usuarios</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Gestiona todos los usuarios de tu plataforma. Crea, edita y administra perfiles, roles y permisos de manera intuitiva.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Gestión completa de usuarios</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Control de roles y permisos</span>
                </div>
              </div>

              {/* Action button - appears on hover */}
              <div className={`transition-all duration-300 ${
                hoveredModule === 'usuarios' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <a href="/users">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                  Gestionar Usuarios
                  </button>
                </a>
                
              </div>
            </div>
          </div>

          {/* Lessons Module */}
          <div
            className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 cursor-pointer transition-all duration-300 transform ${
              hoveredModule === 'lessons' ? 'scale-105 bg-white/95' : 'hover:scale-102'
            } shadow-2xl`}
            onMouseEnter={() => setHoveredModule('lessons')}
            onMouseLeave={() => setHoveredModule(null)}
            onClick={() => handleModuleClick('lessons')}
          >
            {/* Floating dots */}
            <div className="absolute top-6 right-6 w-3 h-3 bg-emerald-400/40 rounded-full"></div>
            <div className="absolute top-12 right-12 w-2 h-2 bg-teal-400/30 rounded-full"></div>
            <div className="absolute bottom-8 left-8 w-4 h-4 bg-emerald-300/20 rounded-full"></div>

            <div className="relative">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                hoveredModule === 'lessons' ? 'rotate-3 scale-110' : ''
              }`}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Lessons</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Administra el contenido educativo. Crea nuevas lecciones, organiza por categorías y gestiona el material de aprendizaje.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">Contenido interactivo</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Seguimiento de progreso</span>
                </div>
              </div>

              {/* Action button - appears on hover */}
              <div className={`transition-all duration-300 ${
                hoveredModule === 'lessons' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <a href="/Lessons">
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg">
                  Gestionar Lessons
                </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <p className="text-white/80">
            Haz clic en cualquier módulo para acceder a sus funcionalidades
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;