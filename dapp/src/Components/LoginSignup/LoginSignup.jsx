import React, { useState } from "react";
import './LoginSignup.css'
import aadhar_icon from '../Assets/digital.png'
import user_icon from '../Assets/user.png'
import key_icon from '../Assets/key.png'
import Web3 from "web3";
import configuration from '../../AccountRegistration.json'

const contractAddress = '0xB00EA762AE4FC2f21E564fB077EbBAff9FA6Fd53';
const contractABI = configuration.abi;

export const LoginSignup = () => {
    const [action, setAction] = useState("Sign Up");
    const [username, setUsername] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");

    const handleSubmit = async () => {
        try {
            if (action === "Sign Up") {
                // Request MetaMask account access
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                const account = accounts[0];
                console.log(account);

                // Create a Web3 instance using the provider from MetaMask
                const web3Instance = new Web3(window.ethereum);

                // Connect to your contract using the Web3 instance
                const contract = new web3Instance.eth.Contract(contractABI, contractAddress);

                // Call the setUserDetails function on the contract
                const gas = 2000000; // Adjust the gas limit as needed
                const transaction = await contract.methods.setUserDetails(username, aadharNumber).send({ from: account, gas });

                // Check for transaction confirmation
                if (transaction.status === true) {
                    console.log("User details set successfully!");
                } else {
                    console.error("Transaction failed:", transaction.errorMessage);
                }
            }
        } catch (error) {
            console.error("Error setting user details:", error);
        }
    };

    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>{action}</div>
                <div className="underline"> </div>
            </div>
            <div className="inputs">
                {action === "Login" ? <div></div> : <div className="input">
                    <img src={user_icon} alt="" />
                    <input type="text" placeholder='USER NAME' value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>}
                {action === "Sign Up" ? <div className="input">
                    <img src={aadhar_icon} alt="" />
                    <input type="number" placeholder='AADHAR NUMBER' value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} />
                </div> : <div className="input">
                    <img src={key_icon} alt="" />
                    <input type="password" placeholder='PRIVATE KEY' />
                </div>}
            </div>
            <div className="submit-container">
                <button className={action === 'Login' ? "submit gray" : "submit"} onClick={handleSubmit}>
                    {action}
                </button>
                <div className={action === 'Login' ? "submit" : "submit gray"} onClick={() => setAction("Sign Up")}>
                    {action === 'Login' ? 'Sign Up' : 'Login'}
                </div>
            </div>
        </div>
    );
}

export default LoginSignup;