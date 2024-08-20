import { useContext, useEffect, useState } from 'react'

import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Chat from './pages/chat/Chat'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/AppContext'


function App() {
  const [count, setCount] = useState(0)
  const navigate=useNavigate();
 const {loadUserData}=useContext(AppContext)

useEffect(()=>{
   onAuthStateChanged(auth, async (user)=>{
       if(user){
        await loadUserData(user.uid)
        navigate('/chat')
        
       }
       else{
         navigate('/')
       }
   })
},[])
  return (
    <>
    <ToastContainer />
      <Routes >
        <Route path='/' element={<Login />} ></Route>
        <Route path='/chat' element={<Chat />}></Route>
        <Route path='/profile' element={<ProfileUpdate />}></Route>
      </Routes>
    
    </>
  )
}

export default App
