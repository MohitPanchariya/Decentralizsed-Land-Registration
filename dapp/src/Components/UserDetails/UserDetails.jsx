// Import necessary libraries
import React, { useEffect, useState } from "react";
import Web3 from "web3"; // Import web3 library
import configuration from "../../AccountRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import "./UserDetails.css";

const UserDetails = ({accountContractAddress}) => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    userAddress: "",
    phoneNumber: 0,
    isUserVerified: false,
    designation: 0,
    registrationDate: 0,
  });

  
  const [verificationRequested, setVerificationRequested] = useState(false);

  // Convert Unix timestamp to human-readable date
  const registrationDate = new Date(
    Number(userDetails.registrationDate) * 1000
  );

  const getUserDetails = async () => {
    try {
      // Connect to the user's MetaMask provider
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);

        // Get the user's accounts
        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];

        const contractABI = configuration.abi;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractABI, accountContractAddress);

        // Call the getUserDetailsByAddress function
        const result = await contract.methods
          .getUserDetailsByAddress(userAddress)
          .call();

        if (result) {
          console.log("User Details retrieved successfully");
          // Update the user details in the state
          setUserDetails({
            username: result[0],
            isUserVerified: result[1],
            designation: result[2],
            registrationDate: result[3],
            phoneNumber: result[4],
            userAddress: result[5],
          });
        } else {
          console.error("Error retrieving user details");
          // Handle errors or display an error message to the user
        }
      }
    } catch (error) {
      console.error("Error retrieving user details:", error);
      // Handle errors or display an error message to the user
    }
  };

  const handleRequestVerification = async () => {
    try {
      await getUserDetails(); // Call the getUserDetails function

      // Only proceed with the verification request if the user is not already verified
      if (!userDetails.isUserVerified) {
        const web3 = new Web3(window.ethereum);

        // Get the user's accounts
        const accounts = await web3.eth.getAccounts();

        const contractABI = configuration.abi;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractABI, accountContractAddress);

        // Call the requestVerification function
        const transaction = await contract.methods
          .requestVerification(userDetails.phoneNumber)
          .send({
            from: accounts[0], // Assuming the user is using the first account
          });

        if (transaction) {
          console.log("Verification request sent successfully!");
          alert("Verification request sent successfully!");
          setVerificationRequested(true);
          // Add any additional logic or UI updates as needed
        } else {
          console.error("Error sending verification request");
          // Handle errors or display an error message to the user
        }
      }
    } catch (error) {
      console.error("Error handling verification request:", error);
      // Handle errors or display an error message to the user
    }
  };

  // useEffect to retrieve user details on component mount
    // useEffect to retrieve user details on component mount
    useEffect(() => {
      const checkPendingVerification = async () => {
        try {
          // Connect to the user's MetaMask provider
          if (window.ethereum) {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const web3 = new Web3(window.ethereum);
  
            // Get the user's accounts
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
  
            const contractABI = configuration.abi;
  
            // Create a contract instance
            const contract = new web3.eth.Contract(contractABI, accountContractAddress);
  
            // Check if userAddress is in the pending verification list
            const pendingVerificationsList = await contract.methods.getPendingVerifications().call();
            const isUserInPendingVerifications = pendingVerificationsList.some((verification) => verification.userAddress === userAddress);
  
            setVerificationRequested(isUserInPendingVerifications);
          }
        } catch (error) {
          console.error("Error checking pending verification:", error);
          // Handle errors or display an error message to the user
        }
      };
  
      // Call the checkPendingVerification function on mount
      checkPendingVerification();
  
      // Call the getUserDetails function
      getUserDetails();
    }, []);

  return (
    <div classname="user-card-container">
      {userDetails.designation.toString() !== '0' ? (
        <SidebarAdmin />
      ) : (
        <Sidebar />
      )}
      <div className="user-card">
        <center>
          <h1>WELCOME {userDetails.username.toLocaleUpperCase()}!</h1>
        </center>
        <p className="user-details"><b>Username: </b>{userDetails.username}</p>
        <p className="user-details"><b>User Address: </b>{userDetails.userAddress}</p>
        <p className="user-details">
          <b>Phone Number: </b>{String(userDetails.phoneNumber)}
        </p>
        <p className="user-details">
          <b>User Verified: </b>{String(userDetails.isUserVerified)}
        </p>
        <p className="user-details">
          <b>Designation: </b>{String(userDetails.designation)}
        </p>
        <p className="user-details">
          <b>Registration Date: </b>{registrationDate.toLocaleString()}
        </p>

        {!userDetails.isUserVerified && (
          <button
            className={`submit-verification ${verificationRequested ? 'verification-requested' : ''}`}
            onClick={handleRequestVerification}
          >
            {verificationRequested ? 'Verification Requested' : 'Request Verification'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
