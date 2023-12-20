import React, { useState } from "react";
import './LoginSignup.css'
import aadhar_icon from '../Assets/digital.png'
import user_icon from '../Assets/user.png'
import key_icon from '../Assets/key.png'

export const LoginSignup = () => {

    const [action, setAction] = useState("Sign Up");
  return (
    <div className='container'>
    <div className='header'>
           <div className='text'>{action}</div>
           <div className="underline"> </div> 
        </div>
        <div className="inputs">
            {action==="Login"?<div></div>:<div className="input">
                <img src={user_icon} alt="" />
                <input type="text" placeholder='USER NAME' />
            </div>}
            {action==="Sign Up"?<div className="input">
                <img src={aadhar_icon} alt="" className='aadhar_icon'/>
                <input type="number" placeholder='AADHAR NUMBER'/>
            </div>:<div className="input">
                <img src={key_icon} alt="" className='aadhar_icon'/>
                <input type="password" placeholder='PRIVATE KEY'/>
            </div>}
        </div>
        <div className="submit-container">
            <div className={action==='Login'?"submit gray":"submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
            <div className={action==='Sign Up'?"submit gray":"submit"} onClick={()=>{setAction("Login")}}>Login</div>
        </div>
    </div>
  )
}

export default LoginSignup