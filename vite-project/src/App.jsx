
import './App.css'
import HookUseState from './playground/HookUseState'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomeHooks from './playground/HomeHooks'
import HookUseNavigate from './playground/HookUseNavigate'
import HookUseEffect from './playground/HookUseEffect'
import HookUseContext from './playground/HookUseContext'
import HookUseReducer from './playground/HookUseReducer'
import HookUseCallback from './playground/HookUseCallback'
import Register from '/src/pages/Register'
import Lessons from '/src/pages/Lessons'
import Dashboard from './pages/Dashboard'
import UsersInterface from './pages/UsersInterface'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DataDeletion from './pages/DataDeletion';
import Profile from './pages/Profile';

function App() {

  return (
   <BrowserRouter>
    <Routes>
      {/*Rutas */}
      <Route path='/' element={<Login/>} ></Route>
      <Route path='/useEffect' element={<HookUseEffect/>} ></Route>
      <Route path='/useState' element={<HookUseState/>} ></Route>
      <Route path='/useNavigate' element={<HookUseNavigate/>} ></Route>
      <Route path='/useContext' element={<HookUseContext/>} ></Route>
      <Route path='/useReducer' element={<HookUseReducer/>} ></Route>
      <Route path='/useCallback' element={<HookUseCallback/>} ></Route>
      <Route path='/Register' element={<Register/>} ></Route>
      <Route path='/Lessons' element={<Lessons/>} ></Route>
      <Route path='/Dashboard' element={<Dashboard/>} ></Route>
      <Route path='/Users' element={<UsersInterface/>} ></Route>
      <Route path='/Login' element={<Login/>} ></Route>
      <Route path='/ForgotPassword' element={<ForgotPassword/>} ></Route>
      <Route path='/ResetPassword' element={<ResetPassword/>} ></Route>
      <Route path="/privacy" element={<Privacy />} ></Route>
      <Route path="/terms" element={<Terms />} ></Route>
      <Route path="/data-deletion" element={<DataDeletion />} ></Route>
      <Route path="/profile" element={<Profile />} ></Route>
    </Routes>
   
   </BrowserRouter>
  )
}

export default App