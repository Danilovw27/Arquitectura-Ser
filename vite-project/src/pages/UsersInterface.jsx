import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, ArrowLeft, UserCheck, UserX, Crown, Shield, User, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UsersInterface = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'usuario'
  });
  const [editUserData, setEditUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'usuario',
    estado: 'activo'
  });
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const { firstName, lastName, email, password, confirmPassword, role } = newUserData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Swal.fire("Error", "Todos los campos son obligatorios", "error");
    }

    if (password.length < 6) {
      return Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
    }

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    if (role === 'admin') {
      const result = await Swal.fire({
        title: '¿Crear usuario administrador?',
        text: 'Esta acción creará un usuario con privilegios de administrador',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear admin',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }
    
    setCreatingUser(true);
    
    try {
      const emailLower = email.toLowerCase();
      const userMethod = await createUserWithEmailAndPassword(auth, emailLower, password);
      const user = userMethod.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: emailLower,
        estado: "activo",
        rol: role,
        creado: new Date(),
        metodo: "password",
        creadoPor: 'admin-interface'
      });

      const newUser = {
        id: user.uid,
        uid: user.uid,
        firstName,
        lastName,
        email: emailLower,
        estado: "activo",
        rol: role,
        creado: new Date(),
        metodo: "password"
      };
      
      setUsers([newUser, ...users]);

      Swal.fire("¡Éxito!", `Usuario ${role} creado exitosamente`, "success");
      
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'usuario'
      });
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('Error creando usuario:', error);
      
      if (error.code === "auth/email-already-in-use") {
        Swal.fire("Error", "Este correo electrónico ya está registrado", "error");
      } else if (error.code === "auth/weak-password") {
        Swal.fire("Error", "La contraseña es muy débil", "error");
      } else if (error.code === "auth/invalid-email") {
        Swal.fire("Error", "Correo electrónico inválido", "error");
      } else {
        Swal.fire("Error", `No se pudo crear el usuario: ${error.message}`, "error");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const openEditModal = (user) => {
    setEditUserData({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.rol || 'usuario',
      estado: user.estado || 'activo'
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    const { id, firstName, lastName, email, role, estado } = editUserData;

    if (!firstName || !lastName || !email) {
      return Swal.fire("Error", "Nombre, apellido y email son obligatorios", "error");
    }

    const currentUser = users.find(u => u.id === id);
    if (role === 'admin' && currentUser?.rol !== 'admin') {
      const result = await Swal.fire({
        title: '¿Cambiar a administrador?',
        text: 'Esta acción dará privilegios de administrador a este usuario',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar rol',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }
    
    setEditingUser(true);
    
    try {
      const userRef = doc(db, 'usuarios', id);
      
      await updateDoc(userRef, {
        firstName,
        lastName,
        email: email.toLowerCase(),
        rol: role,
        estado,
        actualizado: new Date()
      });

      setUsers(users.map(user => 
        user.id === id 
          ? { 
              ...user, 
              firstName, 
              lastName, 
              email: email.toLowerCase(), 
              rol: role, 
              estado 
            }
          : user
      ));

      Swal.fire({
        title: "¡Actualizado!",
        text: "Usuario actualizado exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      
      setShowEditModal(false);
      setEditUserData({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'usuario',
        estado: 'activo'
      });
      
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      Swal.fire("Error", `No se pudo actualizar el usuario: ${error.message}`, "error");
    } finally {
      setEditingUser(false);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'usuario'
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUserData({
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'usuario',
      estado: 'activo'
    });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usersData = [];
      
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      usersData.sort((a, b) => {
        const dateA = a.creado?.toDate() || new Date(0);
        const dateB = b.creado?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Swal.fire('Error', `No se pudieron cargar los usuarios: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      Swal.fire('Error', 'La carga de usuarios tardó demasiado. Verifica tu conexión.', 'warning');
    }, 10000);

    loadUsers().finally(() => {
      clearTimeout(timeout);
    });
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      const userRef = doc(db, 'usuarios', userId);
      
      await updateDoc(userRef, {
        estado: newStatus
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, estado: newStatus } : user
      ));
      
      Swal.fire(
        'Actualizado',
        `Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado del usuario', 'error');
    }
  };

  const deleteUser = async (userId, userEmail) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al usuario ${userEmail}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'usuarios', userId));
        setUsers(users.filter(user => user.id !== userId));
        Swal.fire('Eliminado', 'Usuario eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'moderador': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'moderador': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-800 via-emerald-800 to-green-400 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-white">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                <p className="text-white/80">Administra todos los usuarios de la plataforma</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Crear Usuario
            </button>
            <div className="text-white text-right">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-white/80 text-sm">Total usuarios</div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
              <option value="moderador">Moderador</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <button
              onClick={loadUsers}
              className="bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando usuarios...</h3>
            <p className="text-gray-500">Por favor espera un momento</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                    user.estado === 'activo' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getRoleColor(user.rol)}`}>
                    {getRoleIcon(user.rol)}
                    {user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Creado:</span> {' '}
                    {user.creado?.toDate()?.toLocaleDateString() || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Método:</span> {user.metodo || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleUserStatus(user.id, user.estado)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      user.estado === 'activo'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.estado === 'activo' ? (
                      <>
                        <UserX className="w-4 h-4 inline mr-1" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        Activar
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
                    title="Editar usuario"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Usuario</h2>
                  <button
                    onClick={closeCreateModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={creatingUser}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                    <select
                      name="role"
                      value={newUserData.role}
                      onChange={handleNewUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      required
                      disabled={creatingUser}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="firstName"
                          value={newUserData.firstName}
                          onChange={handleNewUserChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                          placeholder="Nombre"
                          required
                          disabled={creatingUser}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="lastName"
                          value={newUserData.lastName}
                          onChange={handleNewUserChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                          placeholder="Apellido"
                          required
                          disabled={creatingUser}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={newUserData.email}
                        onChange={handleNewUserChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        placeholder="correo@ejemplo.com"
                        required
                        disabled={creatingUser}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={newUserData.password}
                        onChange={handleNewUserChange}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength="6"
                        disabled={creatingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={creatingUser}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={newUserData.confirmPassword}
                        onChange={handleNewUserChange}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        placeholder="Confirmar contraseña"
                        required
                        disabled={creatingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={creatingUser}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={creatingUser}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {creatingUser ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        'Crear Usuario'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Editar Usuario</h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={editingUser}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      name="estado"
                      value={editUserData.estado}
                      onChange={handleEditUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      required
                      disabled={editingUser}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                    <select
                      name="role"
                      value={editUserData.role}
                      onChange={handleEditUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      required
                      disabled={editingUser}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="firstName"
                          value={editUserData.firstName}
                          onChange={handleEditUserChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                          placeholder="Nombre"
                          required
                          disabled={editingUser}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="lastName"
                          value={editUserData.lastName}
                          onChange={handleEditUserChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                          placeholder="Apellido"
                          required
                          disabled={editingUser}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={editUserData.email}
                        onChange={handleEditUserChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        placeholder="correo@ejemplo.com"
                        required
                        disabled={editingUser}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Por razones de seguridad, el cambio de contraseña debe ser realizado por el usuario mediante la opción "Olvidé mi contraseña" en el login.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={editingUser}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={editingUser}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {editingUser ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Actualizando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersInterface;