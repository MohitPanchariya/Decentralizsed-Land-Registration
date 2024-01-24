// Import necessary libraries
import React, { useState, useEffect } from "react";
import Web3 from "web3"; // Import web3 library
import configuration from "../../AccountRegistration.json";
import "./UserDetails.css";
import Sidebar from "../Sidebar/Sidebar";

const UserDetails = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    userAddress: "",
    aadharNumber: 0,
    isUserVerified: false,
    designation: 0,
    registrationDate: 0,
  });

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

        // Replace 'YourContractAddress' and 'YourContractABI' with the actual contract address and ABI
        const contractAddress = "0xe9881Ed752ec7B584DECcD7857867cf3907Bdfc1";
        const contractABI = configuration.abi;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractABI, contractAddress);

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
            aadharNumber: result[4],
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

        // Replace 'YourContractAddress' and 'YourContractABI' with the actual contract address and ABI
        const contractAddress = "0x9F4d677872ccfEDCA1b660A2a67AAD14D49812E9";
        const contractABI = configuration.abi;

        // Create a contract instance
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Call the requestVerification function
        const transaction = await contract.methods
          .requestVerification(userDetails.aadharNumber)
          .send({
            from: accounts[0], // Assuming the user is using the first account
          });

        if (transaction) {
          console.log("Verification request sent successfully!");
          alert("Verification request sent successfully!");
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
  useEffect(() => {
    getUserDetails(); // Call the getUserDetails function
  }, []);

  return (
    <div classname="user-card-container">
      <Sidebar />
      <div className="user-card">
        <center>
          <h1>WELCOME {userDetails.username.toLocaleUpperCase()}!</h1>
        </center>
        <p className="user-details"><b>Username: </b>{userDetails.username}</p>
        <p className="user-details"><b>User Address: </b>{userDetails.userAddress}</p>
        <p className="user-details">
          <b>Aadhar Number: </b>{String(userDetails.aadharNumber)}
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
            className="submit-verification"
            onClick={handleRequestVerification}
          >
            Request Verification
          </button>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
