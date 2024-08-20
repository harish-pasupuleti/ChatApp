import React, { useState } from 'react'
import './Login.css'
import { login, signup,resetPass } from '../../config/firebase'


const Login = () => {
  const [currtState,setCurrState]=useState("Sign up")
  const [UserName,setUserName]=useState("");
  const [Email,setEmail]=useState("");
  const [Pass,setPass]=useState("");
  
  const onSubmitHandler =(event)=>{
           event.preventDefault();
           if(currtState==='Sign up'){
            signup(UserName,Email,Pass);
           }
           else{
            login(Email,Pass);
           }
  }

  return (
    <div className='login'>
         <div >
            
             <form className='login-form'>
             <h1>{currtState}</h1>
             {currtState=='Sign up' ? <input onChange={(e)=>setUserName(e.target.value)} value={UserName} type="text" placeholder='Username' className='form-input' required  />:null}
             <input onChange={(e)=>setEmail(e.target.value)} value={Email} type="text" placeholder='Email' className='form-input' required />
             <input type="password" onChange={(e)=>setPass(e.target.value)} value={Pass} placeholder='Password' className='form-input'  required />
             <button onClick={onSubmitHandler} type='submit'>{currtState=='Sign up' ? 'Sign Up':'Login'}</button>
             <div className='login-terms'>
             <input type='checkbox' required />
             <p>Accept terms and conditions</p>
             </div>
             <div className='login-acc'>
              {
                currtState=='Sign up' ? <p>Already Have an account <span onClick={()=>setCurrState("Login")}> click here</span></p>:
                <p>Don't Have an account <span onClick={()=>setCurrState("Sign up")}> click here</span></p>

              }
              { 
                currtState === "Login" ?
                <p>Forgot Password <span onClick={()=>resetPass(Email)}> Reset here</span></p>
                :null
              }

             </div>
             </form>
             

         </div>
    </div>
  )
}

export default Login