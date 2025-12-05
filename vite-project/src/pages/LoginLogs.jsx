import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { LogIn, Calendar, User, Mail, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoginLogs();
  }, [filter]);

  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      let logsQuery;
      const logsRef = collection(db, 'loginLogs');
      
      // Aplicar filtros de fecha
      const now = new Date();
      let startDate = new Date();

      switch (filter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = new Date(0); // Desde el inicio de los tiempos
      }

      if (filter === 'all') {
        logsQuery = query(logsRef, orderBy('timestamp', 'desc'));
      } else {
        logsQuery = query(
          logsRef,
          where('timestamp', '>=', startDate),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(logsQuery);
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '🔵';
      case 'github':
        return '⚫';
      case 'facebook':
        return '🔵';
      case 'email':
        return '📧';
      default:
        return '🔐';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return timestamp.toLocaleDateString();
  };

  const getStats = () => {
    const total = logs.length;
    const socialLogins = logs.filter(log => log.method === 'social').length;
    const emailLogins = logs.filter(log => log.method === 'password').length;
    
    const providers = {};
    logs.forEach(log => {
      providers[log.provider] = (providers[log.provider] || 0) + 1;
    });

    return { total, socialLogins, emailLogins, providers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando logs de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LogIn className="w-8 h-8" />
              Logs de Acceso
            </h1>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2">
            {['all', 'today', 'week', 'month'].map((timeFilter) => (
              <button
                key={timeFilter}
                onClick={() => setFilter(timeFilter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === timeFilter
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {timeFilter === 'all' && 'Todos'}
                {timeFilter === 'today' && 'Hoy'}
                {timeFilter === 'week' && 'Semana'}
                {timeFilter === 'month' && 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-gray-600">Total accesos</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.socialLogins}</div>
            <div className="text-gray-600">Social Login</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.emailLogins}</div>
            <div className="text-gray-600">Email/Password</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.providers).length}
            </div>
            <div className="text-gray-600">Proveedores</div>
          </div>
        </div>

        {/* Lista de logs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Historial de Accesos ({logs.length})
          </h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No hay registros de acceso para el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getProviderIcon(log.provider)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">
                          {log.userEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span className="capitalize">{log.provider}</span>
                        <span>•</span>
                        <span className="capitalize">{log.method}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      {getTimeAgo(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proveedores más usados */}
        {Object.keys(stats.providers).length > 0 && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Proveedores más utilizados
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.providers)
                .sort(([,a], [,b]) => b - a)
                .map(([provider, count]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getProviderIcon(provider)}</span>
                      <span className="capitalize font-medium text-gray-700">
                        {provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{count} accesos</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(count / stats.total) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginLogs;