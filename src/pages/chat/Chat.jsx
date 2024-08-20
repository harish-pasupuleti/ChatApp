import React, { useContext, useEffect, useState } from 'react'
import './Chat.css';
import LeftBar from '../../components/LeftBar/LeftBar';
import ChatBox from '../../components/ChatBox/ChatBox';
import RightBar from '../../components/RightBar/RightBar';
import { AppContext } from '../../context/AppContext';
const Chat = () => {

  const {chatData,userData}=useContext(AppContext)
  const [loading,setLoading]=useState(true)
 useEffect(()=>{
  
  
 if(chatData && userData){
  setLoading(false)
 }
 },[chatData,userData])

  return (
    <div className='chat'>
      {
        loading ?
        <p className='loading'>loading...</p>
        :
        <div className='chat-container'>
        <LeftBar />
        <ChatBox />
        <RightBar />
    </div>
      }
        
    </div>
  )
}

export default Chat