import React, { useContext, useEffect, useState } from 'react'
import './RightBar.css'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
const RightBar = () => {

  const {chatUser,messages}=useContext(AppContext)
  const [msgImages,setMsgImages]=useState([])

 useEffect(()=>{
    let tempVar =[];
    messages.map((msg)=>{
      if(msg.image){
        tempVar.push(msg.image)
      }
    })
    setMsgImages(tempVar)
 },[messages])

  return chatUser ? (
    <div className='rs'>
      <div className='rs-profile'>
            <img src={chatUser.userData.avatar} alt='' />
            <h3>{Date.now()-chatUser.userData.lastSeen<=70000 ? <span className='dot'></span>:null}{chatUser.userData.name}</h3>
            <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className='rs-media'>
            <p>media</p>
            <div>
              {
                msgImages.map((url,index)=>(
                  <img onClick={()=>window.open(url)} key={index} src={url} alt='' />
                ))
              }
            </div>
      </div>
      <button onClick={()=>logout()}>Logout</button>
    </div>
  ) 
  :
  (
    <div className='rs'>
         <button onClick={()=>logout()}>logout</button>
    </div>

  )
}

export default RightBar