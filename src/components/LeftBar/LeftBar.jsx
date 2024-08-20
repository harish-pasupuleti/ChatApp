import React, { useContext, useEffect, useState } from 'react'
import  './LeftBar.css'
import { FaSearch } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs,query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';


const LeftBar = () => {
  const navigate=useNavigate()
  const {userData,chatData,setChatdata,chatUser,setChatUser,messageId,setMessageId,chatVisible,setChatVisible}=useContext(AppContext)
  const [user,setUser]=useState(null)
  const [showSearch,setShowSearch]=useState(false);

  const inputHandler = async (event)=>{
     try {
      const input=event.target.value;
      if(input){
        setShowSearch(true)
        const userRef= collection(db,'users');
        const q=query(userRef,where("username","==",input.toLowerCase()))
        const querySnap= await getDocs(q);
        if(!querySnap.empty&&querySnap.docs[0].data().id!==userData.id){
          let userExit=false
          chatData.map((user)=>{
             if(user.rId===querySnap.docs[0].data().id){
              userExit=true
              
             }
              
          })
          if(!userExit){
            setUser(querySnap.docs[0].data())
            
          }
          
        }
        else{
          setUser(null)
        }
      }
      else{
        setShowSearch(false)
      }
     
     } catch (error) {
      
     }
  }

  const addChat = async () => {
    const messagesRef = collection(db, 'messages');
    const chatRef = collection(db, 'chats');
    
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      });
  
      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true
        })
      });
  
      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: false
        })
      });
        
      const uSnap= await getDoc(doc(db,'users',user.id))
      const uData = uSnap.data()
      setChat({
        messageId:newMessageRef.id,
        lastMessage:"",
        rId:user.id,
        updatedAt:Date.now(),
        messageSeen:true,
        userData:uData
      })
      setShowSearch(false)
      setChatVisible(true)
         
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };
  

  const setChat = async (item) => {
    try {
      setMessageId(item.messageId);
      setChatUser(item);
      
      const userChatRef = doc(db, 'chats', userData.id);
      const userChatSnapShot = await getDoc(userChatRef);
      
      if (userChatSnapShot.exists()) {
        const userChatsData = userChatSnapShot.data();
        
        // Safely access chatsData, initialize if undefined
        const chatsData = userChatsData.chatsData || [];
        
        const chatIndex = chatsData.findIndex((c) => c.messageId === item.messageId);
        
        if (chatIndex !== -1) {
          chatsData[chatIndex].messageSeen = true;
          
          await updateDoc(userChatRef, {
            chatsData: chatsData,
          });
  
          // Update the context with the new chat data to trigger a re-render
          const updatedChatData = chatData.map((chatItem) => {
            if (chatItem.messageId === item.messageId) {
              return { ...chatItem, messageSeen: true };
            }
            return chatItem;
          });
  
          setChatUser({ ...item, messageSeen: true });
          setChatdata(updatedChatData);
        } else {
          console.log("Chat with messageId not found in chatsData");
        }
      } else {
        console.log("Chat document does not exist for user");
      }
      setChatVisible(true)
    } catch (error) {
      console.error("Error updating message seen status:", error);
      toast.error(error.message);
    }
  };
  
   useEffect(()=>{
      const updateChatUserData = async () =>{
         
        if(chatUser){
          const userRef = doc(db,'users',chatUser.userData.id)
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data()
          setChatUser(prev=>({...prev,userData:userData}))
        }

      }
      updateChatUserData();

   },[chatData])

  return (
    <div className={`leftbar ${chatVisible ? "hidden" : ""}`}>
      <div className='header'>
      
         <h1>Chat App</h1>
         <CiMenuKebab className='menu'/>
          <div className='sub-menu'>
            <p onClick={()=>navigate('/profile')}>Edit</p>
            <hr></hr>
            <p onClick={()=>logout()}>Logout</p>
          </div>
      </div>
      <div className='search-bar'>
          {/* <FaSearch /> */}
           <input onChange={inputHandler} type='text' placeholder='Search' />
      </div>
      <div className='user-info'>
        {
          showSearch && user  ? 
          <div onClick={addChat} className='friends add-user'>
                <img src={user.avatar} alt='' />
                <p>{user.name}</p>
          </div>:
          chatData.map((item,index)=>(
            <div onClick={()=>setChat(item)} key={index} className={`friends ${ item.messageSeen || item.messageId === messageId ? "" :"border"}`}>
            <img src={item.userData.avatar} alt='' className='dp' />
            <div>
            <p>{item.userData.name}</p>
            <span>{item.lastMessage}</span>
            </div>
            </div>
          ))
         }
            
      </div>
    </div>
  )
}

export default LeftBar