// LessonsInterface.jsx
import React, { useState, useEffect } from 'react';
import { Languages, Plus, Edit, Trash2, CheckCircle, X, Globe, ArrowLeft, FileText, Table } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db} from '../firebase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const LessonsInterface = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pendiente',
    language: 'ingles',
    level: 'principiante'
  });

  const navigate = useNavigate();

  // Idiomas disponibles
  const languages = [
    { value: 'ingles', label: 'Inglés', flag: '🇬🇧' },
    { value: 'frances', label: 'Francés', flag: '🇫🇷' },
    { value: 'aleman', label: 'Alemán', flag: '🇩🇪' },
    { value: 'italiano', label: 'Italiano', flag: '🇮🇹' },
    { value: 'portugues', label: 'Portugués', flag: '🇵🇹' },
    { value: 'chino', label: 'Chino', flag: '🇨🇳' },
    { value: 'japones', label: 'Japonés', flag: '🇯🇵' },
    { value: 'coreano', label: 'Coreano', flag: '🇰🇷' },
    { value: 'ruso', label: 'Ruso', flag: '🇷🇺' },
    { value: 'arabe', label: 'Árabe', flag: '🇸🇦' }
  ];

  // Niveles de competencia
  const levels = [
    { value: 'principiante', label: 'Principiante (A1-A2)', color: 'bg-green-100 text-green-800' },
    { value: 'intermedio', label: 'Intermedio (B1-B2)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'avanzado', label: 'Avanzado (C1-C2)', color: 'bg-red-100 text-red-800' }
  ];

  // Función para exportar a PDF
  const exportToPDF = () => {
    if (lessons.length === 0) {
      Swal.fire('Información', 'No hay datos para exportar', 'info');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Encabezado
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Reporte de Lecciones', 105, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 105, 30, { align: 'center' });
      
      // Tabla
      const tableData = lessons.map(lesson => [
        lesson.title || 'Sin título',
        lesson.description || 'Sin descripción',
        getLanguageLabel(lesson.language) || 'No especificado',
        getStatusLabel(lesson.status) || 'No especificado',
        getLevelLabel(lesson.level) || 'No especificado',
        lesson.createdAt 
          ? (lesson.createdAt.toDate ? lesson.createdAt.toDate().toLocaleDateString('es-ES') : new Date(lesson.createdAt).toLocaleDateString('es-ES'))
          : 'Sin fecha'
      ]);
      
      autoTable(doc, {
        head: [['Título', 'Descripción', 'Idioma', 'Estado', 'Nivel', 'Fecha Creación']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      doc.save(`lecciones-${new Date().toISOString().split('T')[0]}.pdf`);
      
      Swal.fire('Éxito', 'PDF exportado correctamente', 'success');
    } catch (error) {
      console.error('Error generando PDF:', error);
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (lessons.length === 0) {
      Swal.fire('Información', 'No hay datos para exportar', 'info');
      return;
    }

    try {
      const worksheetData = lessons.map(lesson => ({
        'Título': lesson.title || 'Sin título',
        'Descripción': lesson.description || 'Sin descripción',
        'Idioma': getLanguageLabel(lesson.language) || 'No especificado',
        'Estado': getStatusLabel(lesson.status) || 'No especificado',
        'Nivel': getLevelLabel(lesson.level) || 'No especificado',
        'Fecha Creación': lesson.createdAt 
          ? (lesson.createdAt.toDate ? lesson.createdAt.toDate().toLocaleDateString('es-ES') : new Date(lesson.createdAt).toLocaleDateString('es-ES'))
          : 'Sin fecha',
        'Última Actualización': lesson.updatedAt 
          ? (lesson.updatedAt.toDate ? lesson.updatedAt.toDate().toLocaleDateString('es-ES') : new Date(lesson.updatedAt).toLocaleDateString('es-ES'))
          : 'Sin fecha'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecciones');
      
      // Auto ajustar columnas
      const wscols = [
        { wch: 30 }, // Título
        { wch: 50 }, // Descripción
        { wch: 15 }, // Idioma
        { wch: 15 }, // Estado
        { wch: 20 }, // Nivel
        { wch: 15 }, // Fecha Creación
        { wch: 20 }  // Última Actualización
      ];
      worksheet['!cols'] = wscols;
      
      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
      });
      
      saveAs(data, `lecciones-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      Swal.fire('Éxito', 'Excel exportado correctamente', 'success');
    } catch (error) {
      console.error('Error generando Excel:', error);
      Swal.fire('Error', 'No se pudo generar el archivo Excel', 'error');
    }
  };

  // Función auxiliar para obtener etiqueta de nivel
  const getLevelLabel = (level) => {
    const levelObj = levels.find(l => l.value === level);
    return levelObj ? levelObj.label : level;
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      console.log('Cargando lecciones desde Firebase...');
      
      const querySnapshot = await getDocs(collection(db, "lecciones"));
      const lessonsData = [];
      
      querySnapshot.forEach((doc) => {
        lessonsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar por fecha de creación (más reciente primero)
      lessonsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      console.log('Lecciones cargadas:', lessonsData.length);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Swal.fire('Error', 'No se pudieron cargar las lecciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);



  // CREAR - Abrir modal
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentLesson(null);
    setFormData({
      title: '',
      description: '',
      status: 'pendiente',
      language: 'ingles',
      level: 'principiante'
    });
    setShowModal(true);
  };

  // EDITAR - Abrir modal
  const openEditModal = (lesson) => {
    setIsEditing(true);
    setCurrentLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      status: lesson.status,
      language: lesson.language,
      level: lesson.level
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentLesson(null);
    setFormData({
      title: '',
      description: '',
      status: 'pendiente',
      language: 'ingles',
      level: 'principiante'
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // GUARDAR - Crear o actualizar en Firebase
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return Swal.fire('Error', 'El título es obligatorio', 'error');
    }

    setSaving(true);

    try {
      if (isEditing && currentLesson) {
        // ACTUALIZAR lección existente en Firebase
        const lessonRef = doc(db, 'lecciones', currentLesson.id);
        await updateDoc(lessonRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        
        // Actualizar estado local
        setLessons(lessons.map(lesson => 
          lesson.id === currentLesson.id 
            ? { ...lesson, ...formData, updatedAt: new Date() }
            : lesson
        ));
        
        Swal.fire('¡Éxito!', 'Lección actualizada correctamente', 'success');
      } else {
        // CREAR nueva lección en Firebase
        const docRef = await addDoc(collection(db, 'lecciones'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Agregar al estado local
        const newLesson = {
          id: docRef.id,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setLessons([newLesson, ...lessons]);
        Swal.fire('¡Éxito!', 'Lección creada correctamente', 'success');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving lesson:', error);
      Swal.fire('Error', `No se pudo guardar la lección: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ELIMINAR lección de Firebase
  const handleDelete = async (lessonId, lessonTitle) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la lección "${lessonTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'lecciones', lessonId));
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        Swal.fire('Eliminada', 'Lección eliminada exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        Swal.fire('Error', 'No se pudo eliminar la lección', 'error');
      }
    }
  };

  // CAMBIAR ESTADO de la lección
  const toggleStatus = async (lessonId, currentStatus) => {
    const statusFlow = {
      'pendiente': 'en-progreso',
      'en-progreso': 'completada',
      'completada': 'pendiente'
    };
    
    const newStatus = statusFlow[currentStatus] || 'pendiente';
    
    try {
      const lessonRef = doc(db, 'lecciones', lessonId);
      await updateDoc(lessonRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setLessons(lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, status: newStatus } : lesson
      ));
      
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `Ahora está: ${getStatusLabel(newStatus)}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  // Funciones auxiliares
  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return 'bg-green-100 text-green-800 border-green-200';
      case 'en-progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completada': return 'Dominada';
      case 'en-progreso': return 'Estudiando';
      default: return 'Por Estudiar';
    }
  };

  const getLevelColor = (level) => {
    const levelObj = levels.find(l => l.value === level);
    return levelObj ? levelObj.color : 'bg-gray-100 text-gray-800';
  };

  const getLanguageFlag = (langValue) => {
    const lang = languages.find(l => l.value === langValue);
    return lang ? lang.flag : '🌐';
  };

  const getLanguageLabel = (langValue) => {
    const lang = languages.find(l => l.value === langValue);
    return lang ? lang.label : langValue;
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-gray-700 to-blue-400 overflow-y-auto">
      <div className="w-4/5 h-full mx-auto my-[2%] p-5 md:p-6 lg:p-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-white">
              <Languages className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Gestión de Lecciones</h1>
                <p className="text-white/80">Administra tu aprendizaje de idiomas</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Exportar a PDF"
                disabled={loading || lessons.length === 0}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Exportar a Excel"
                disabled={loading || lessons.length === 0}
              >
                <Table className="w-4 h-4" />
                Excel
              </button>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Lección
            </button>
            <div className="text-white text-right">
              <div className="text-2xl text-center font-bold">{lessons.length}</div>
              <div className="text-white/80 text-sm">Total lecciones</div>
            </div>
          </div>
        </div>

        {/* CONTADOR */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {lessons.filter(l => l.status === 'pendiente').length}
              </div>
              <div className="text-sm text-gray-600">Por Estudiar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {lessons.filter(l => l.status === 'en-progreso').length}
              </div>
              <div className="text-sm text-gray-600">Estudiando</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {lessons.filter(l => l.status === 'completada').length}
              </div>
              <div className="text-sm text-gray-600">Dominadas</div>
            </div>
          </div>
        </div>

        {/* Botón de actualizar */}
        <div className="mb-6">
          <button
            onClick={loadLessons}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            Actualizar Lista
          </button>
        </div>

        {/* LISTA DE LECCIONES */}
        {loading ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <Languages className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando lecciones...</h3>
            <p className="text-gray-500">Por favor espera un momento</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay lecciones</h3>
            <p className="text-gray-500 mb-4">Crea tu primera lección de idiomas para empezar</p>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              Crear Primera Lección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getLanguageFlag(lesson.language)}</span>
                      <h3 className="text-lg font-bold text-gray-800">{lesson.title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lesson.status)}`}>
                        {getStatusLabel(lesson.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(lesson.level)}`}>
                        {levels.find(l => l.value === lesson.level)?.label.split(' ')[0]}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {getLanguageLabel(lesson.language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleStatus(lesson.id, lesson.status)}
                    className="flex-1 px-3 py-2 bg-indigo-100 text-white rounded-lg hover:bg-indigo-200 transition-all text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Estado
                  </button>
                  
                  <button
                    onClick={() => openEditModal(lesson)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(lesson.id, lesson.title)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL PARA CREAR/EDITAR */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isEditing ? 'Editar Lección' : 'Nueva Lección'}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={saving}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la lección *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: Vocabulario de viajes"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="¿Qué vas a estudiar en esta lección?"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={saving}
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={saving}
                      >
                        {levels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={saving}
                      >
                        <option value="pendiente">Por Estudiar</option>
                        <option value="en-progreso">Estudiando</option>
                        <option value="completada">Dominada</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 text-white px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        isEditing ? 'Actualizar' : 'Crear'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LessonsInterface;