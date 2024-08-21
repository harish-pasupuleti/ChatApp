import React, { useContext, useEffect, useState } from 'react';
import { FaRegImages, FaPaperPlane, FaQuestionCircle } from 'react-icons/fa';
import { IoMdArrowRoundBack } from "react-icons/io";

import './ChatBox.css';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessage ,chatVisible,setChatVisible} = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messageId) {
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        });
  
        // Update the chat metadata for both users
        const userIds = [chatUser.rId, userData.id];
  
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapShot = await getDoc(userChatsRef);
  
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
  
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData
              });
            } else {
              console.error("Chat index not found");
            }
          } else {
            console.error("User chat data not found");
          }
        });
      }
    } catch (error) {
      toast.error("Error sending message: " + error.message);
    }
    setInput("");
  };
  
  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messageId) {
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        });
  
        const userIds = [chatUser.rId, userData.id];
  
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapShot = await getDoc(userChatsRef);
  
          if (userChatsSnapShot.exists()) {
            const userChatData = userChatsSnapShot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = "image";
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
  
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData
              });
            } else {
              console.error("Chat index not found");
            }
          } else {
            console.error("User chat data not found");
          }
        });
      }
    } catch (error) {
      toast.error("Error sending image: " + error.message);
    }
  };
  

  const convertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    return hour > 12 ? `${hour - 12}:${min} PM` : `${hour}:${min} AM`;
  };

  useEffect(() => {
    if (messageId) {
      const unSub = onSnapshot(doc(db, 'messages', messageId), (res) => {
        if (res.exists()) {
          
          setMessage(res.data().messages.reverse());
         
        } else {
          console.log("No messages found");
        }
      });
      return () => unSub();
    }
  }, [messageId]);
  

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "":"hidden"}`}>
      <div className='chat-user'>
        <img src={chatUser.userData.avatar} alt='' />
        <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen<=70000 ? <span className='dot'></span>:null}</p>
        <FaQuestionCircle className='help' />
        <IoMdArrowRoundBack className='arrow' onClick={()=>setChatVisible(false)} />

      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg.image ? (
              <img className='msg-img' src={msg.image} alt='' />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div>
              <img
                src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                alt=''
              />
              <p>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder='Send a message'
        />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <FaRegImages />
        </label>
        <FaPaperPlane onClick={sendMessage} />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "":"hidden"}`}>
      <img src="src/Public/chat.png" alt='' />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
