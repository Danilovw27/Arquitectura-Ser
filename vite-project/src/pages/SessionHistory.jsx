import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Filter,
  Download,
  Search,
  Shield,
  Activity,
  Users,
  FileText,
  Table
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const SessionHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [stats, setStats] = useState({
    totalSessions: 0,
    uniqueUsers: 0,
    activeToday: 0,
    mostUsedProvider: ''
  });

  useEffect(() => {
    fetchSessionHistory();
  }, []);

  // Función para exportar a PDF
  const exportToPDF = () => {
    if (sessions.length === 0) {
      Swal.fire('Información', 'No hay datos para exportar', 'info');
      return;
    }

    try {
      const doc = new jsPDF('landscape');
      
      // Encabezado
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Reporte de Historial de Sesiones', 148, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 148, 30, { align: 'center' });
      
      // Estadísticas
      doc.setFontSize(12);
      doc.text(`Total Sesiones: ${stats.totalSessions} | Usuarios Únicos: ${stats.uniqueUsers} | Activos Hoy: ${stats.activeToday}`, 148, 40, { align: 'center' });
      
      // Tabla
      const tableData = sessions.map(session => [
        session.displayName || 'Sin nombre',
        session.email || '',
        getProviderName(session.provider) || '',
        session.loginTime 
          ? (session.loginTime.toDate ? session.loginTime.toDate().toLocaleDateString('es-ES') : new Date(session.loginTime).toLocaleDateString('es-ES'))
          : 'Sin fecha',
        session.loginTime 
          ? (session.loginTime.toDate ? session.loginTime.toDate().toLocaleTimeString('es-ES') : new Date(session.loginTime).toLocaleTimeString('es-ES'))
          : 'Sin hora'
      ]);
      
      autoTable(doc, {
        head: [['Nombre', 'Email', 'Proveedor', 'Fecha', 'Hora']],
        body: tableData,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [147, 51, 234], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, 148, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      doc.save(`historial-sesiones-${new Date().toISOString().split('T')[0]}.pdf`);
      
      Swal.fire('Éxito', 'PDF exportado correctamente', 'success');
    } catch (error) {
      console.error('Error generando PDF:', error);
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (sessions.length === 0) {
      Swal.fire('Información', 'No hay datos para exportar', 'info');
      return;
    }

    try {
      const worksheetData = sessions.map(session => ({
        'Nombre': session.displayName || 'Sin nombre',
        'Email': session.email || '',
        'Proveedor': getProviderName(session.provider) || '',
        'Fecha Login': session.loginTime 
          ? (session.loginTime.toDate ? session.loginTime.toDate().toLocaleDateString('es-ES') : new Date(session.loginTime).toLocaleDateString('es-ES'))
          : 'Sin fecha',
        'Hora Login': session.loginTime 
          ? (session.loginTime.toDate ? session.loginTime.toDate().toLocaleTimeString('es-ES') : new Date(session.loginTime).toLocaleTimeString('es-ES'))
          : 'Sin hora',
        'ID Usuario': session.userId || '',
        'Tiempo Transcurrido': getTimeAgo(session.loginTime)
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones');
      
      // Auto ajustar columnas
      const wscols = [
        { wch: 20 }, // Nombre
        { wch: 25 }, // Email
        { wch: 15 }, // Proveedor
        { wch: 15 }, // Fecha Login
        { wch: 15 }, // Hora Login
        { wch: 25 }, // ID Usuario
        { wch: 20 }  // Tiempo Transcurrido
      ];
      worksheet['!cols'] = wscols;
      
      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
      });
      
      saveAs(data, `historial-sesiones-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      Swal.fire('Éxito', 'Excel exportado correctamente', 'success');
    } catch (error) {
      console.error('Error generando Excel:', error);
      Swal.fire('Error', 'No se pudo generar el archivo Excel', 'error');
    }
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (sessions.length === 0) {
      Swal.fire('Información', 'No hay datos para exportar', 'info');
      return;
    }

    try {
      const csvContent = [
        ['Email', 'Nombre', 'Proveedor', 'Fecha Login', 'Hora'].join(','),
        ...sessions.map(s => [
          s.email || '',
          s.displayName || 'Sin nombre',
          getProviderName(s.provider) || '',
          s.loginTime 
            ? (s.loginTime.toDate ? s.loginTime.toDate().toLocaleDateString('es-ES') : new Date(s.loginTime).toLocaleDateString('es-ES'))
            : 'Sin fecha',
          s.loginTime 
            ? (s.loginTime.toDate ? s.loginTime.toDate().toLocaleTimeString('es-ES') : new Date(s.loginTime).toLocaleTimeString('es-ES'))
            : 'Sin hora'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `historial-sesiones-${new Date().toISOString().split('T')[0]}.csv`);
      
      Swal.fire('Éxito', 'CSV exportado correctamente', 'success');
    } catch (error) {
      console.error('Error generando CSV:', error);
      Swal.fire('Error', 'No se pudo generar el archivo CSV', 'error');
    }
  };

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      // Leer de la colección session_logs
      const sessionLogsRef = collection(db, 'session_logs');
      const q = query(sessionLogsRef, orderBy('loginTime', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loginTime: doc.data().loginTime?.toDate() || new Date()
      }));

      setSessions(sessionData);
      calculateStats(sessionData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Swal.fire('Error', 'No se pudieron cargar las sesiones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeToday = data.filter(s => {
      const loginDate = new Date(s.loginTime);
      loginDate.setHours(0, 0, 0, 0);
      return loginDate.getTime() === today.getTime();
    }).length;

    // Contar usuarios únicos
    const uniqueUserIds = new Set(data.map(s => s.userId));

    const providerCount = {};
    data.forEach(s => {
      // Normalizar 'email' y 'password' al mismo grupo
      let provider = s.provider || 'password';
      if (provider === 'email') provider = 'password';
      
      providerCount[provider] = (providerCount[provider] || 0) + 1;
    });

    const mostUsed = Object.keys(providerCount).length > 0 
      ? Object.keys(providerCount).reduce((a, b) => 
          providerCount[a] > providerCount[b] ? a : b
        )
      : 'password';

    setStats({
      totalSessions: data.length,
      uniqueUsers: uniqueUserIds.size,
      activeToday,
      mostUsedProvider: mostUsed
    });
  };

  const getProviderIcon = (provider) => {
    switch(provider) {
      case 'google.com':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'facebook.com':
        return <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
      case 'github.com':
        return <svg className="w-5 h-5" fill="#181717" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>;
      case 'password':
      case 'email':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getProviderName = (provider) => {
    const names = {
      'google.com': 'Google',
      'facebook.com': 'Facebook',
      'github.com': 'GitHub',
      'password': 'Email/Password',
      'email': 'Email/Password'
    };
    return names[provider] || 'Email/Password';
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' años';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' meses';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' días';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' horas';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutos';
    
    return 'Hace un momento';
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalizar el provider para la comparación
    const sessionProvider = session.provider || 'password';
    
    // Si el filtro es 'password', también incluir 'email' y viceversa
    let matchesProvider = false;
    if (filterProvider === 'all') {
      matchesProvider = true;
    } else if (filterProvider === 'password' || filterProvider === 'email') {
      matchesProvider = sessionProvider === 'password' || sessionProvider === 'email';
    } else {
      matchesProvider = sessionProvider === filterProvider;
    }
    
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-40 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Volver al Dashboard</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Historial de Sesiones</h1>
                <p className="text-white/90">Control y monitoreo de accesos al sistema</p>
              </div>
              <Activity className="w-12 h-12 text-white/80" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-800">{stats.totalSessions}</span>
              </div>
              <p className="text-gray-600 font-medium">Sesiones Totales</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <User className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-800">{stats.uniqueUsers}</span>
              </div>
              <p className="text-gray-600 font-medium">Usuarios Únicos</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-800">{stats.activeToday}</span>
              </div>
              <p className="text-gray-600 font-medium">Activos Hoy</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-orange-600" />
                <span className="text-xl font-bold text-gray-800">{getProviderName(stats.mostUsedProvider)}</span>
              </div>
              <p className="text-gray-600 font-medium">Método Más Usado</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="pl-12 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los proveedores</option>
                    <option value="google.com">Google</option>
                    <option value="facebook.com">Facebook</option>
                    <option value="github.com">GitHub</option>
                    <option value="password">Email/Password</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={exportToPDF}
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 shadow-lg"
                    title="Exportar a PDF"
                    disabled={loading || sessions.length === 0}
                  >
                    <FileText className="w-5 h-5" />
                    PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg"
                    title="Exportar a Excel"
                    disabled={loading || sessions.length === 0}
                  >
                    <Table className="w-5 h-5" />
                    Excel
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-200 shadow-lg"
                    disabled={loading || sessions.length === 0}
                  >
                    <Download className="w-5 h-5" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Proveedor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Fecha y Hora</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Hace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <span className="text-gray-600 font-medium">Cargando historial...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        {sessions.length === 0 
                          ? "No hay sesiones registradas aún. Inicia sesión para crear el primer registro."
                          : "No se encontraron sesiones que coincidan con tu búsqueda"}
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {session.photoURL ? (
                              <img
                                src={session.photoURL}
                                alt={session.displayName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                                {session.displayName?.charAt(0) || session.email?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">{session.displayName || 'Sin nombre'}</p>
                              <p className="text-sm text-gray-500">{session.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getProviderIcon(session.provider)}
                            <span className="text-gray-700">{getProviderName(session.provider)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-medium">{formatDate(session.loginTime)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{getTimeAgo(session.loginTime)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-white/80">
            {loading ? (
              <p>Cargando datos...</p>
            ) : (
              <p>Mostrando {filteredSessions.length} de {sessions.length} sesiones registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;