import React, { useContext, useEffect, useState } from 'react'
import {FaUserCircle} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import {auth, db} from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import './ProfileUpdate.css'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';
const ProfileUpdate = () => {
  const navigate=useNavigate()
  const [image,setImage]=useState(false);
  const [name,setName]=useState("");
  const [bio,setBio]=useState("")
  const [uid,setUid]=useState("")
  const [prevImage,setPrevImage]=useState("")
  
  const {setUserData}=useContext(AppContext)

  const handleProfileUpdate =async (event)=>{
      event.preventDefault()
      try {
        if(!prevImage && image){
          toast.error("upload profile picture")
        }
        const docRef = doc(db,'users',uid);
        if (image) {
         
          const imgUrl= await upload(image);
          setPrevImage(imgUrl);
          await updateDoc(docRef,{
            avatar:imgUrl,
            bio:bio,
            name:name
          })
          
        }
        else{
          await updateDoc(docRef,{
          
            bio:bio,
            name:name
          })
        }
        const snap= await getDoc(docRef)
        setUserData(snap.data());
        navigate('/chat')
      } catch (error) {
              console.log(error)
              toast.error(error.message)
      }
  }


  useEffect(()=>{
       onAuthStateChanged(auth,async (user)=>{
        if(user){
           setUid(user.uid)
           const docRef=doc(db,'users',user.uid)
           const docSnap=await getDoc(docRef)
           if( docSnap.data().name){
            setName(docSnap.data().name)
           }
           if(docSnap.data().bio){
            setBio(docSnap.data().bio)
           }
           if(docSnap.data().avatar){
            setPrevImage(docSnap.data().avatar)
           }
        }
        else{
           navigate("/")
        }
       })
  },[])
  return (
    <div className='profile'>
      <div className='profile-container'>
           <form onSubmit={handleProfileUpdate}>
            <h3>Profile Details</h3>
            <label htmlFor='avatar' >
              <input onChange={(e)=>setImage(e.target.files[0])} type='file' id='avatar' accept='.png ,.jpg,.jpeg' hidden/>
              {
                image ? <img src={URL.createObjectURL(image)} />:<FaUserCircle />
              }
              upload profile image
            </label>
            <input onChange={(e)=>setName(e.target.value)}  value={name} type='text' placeholder='Your name' required />
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required></textarea>
            <button type='submit'>Save</button>
          </form>
          
          {
                image ? <img src={URL.createObjectURL(image)} className='profile-pic' />:prevImage ? <img src={prevImage} className='profile-pic' />: <FaUserCircle style={{fontSize:150}}/>
              }
      </div>
    </div>
  )
}

export default ProfileUpdate