import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Swal from 'sweetalert2';

export const logout = async (navigate) => {
  try {
    await signOut(auth);
    Swal.fire('Sesión cerrada', 'Hasta pronto 👋', 'success');
    navigate('/login'); // o la ruta que quieras
  } catch (error) {
    Swal.fire('Error', 'No se pudo cerrar sesión', 'error');
  }
};