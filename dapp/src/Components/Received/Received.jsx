import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./Received.css";

const landContractAddress = "0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
const contractABI = configuration.abi;

function ReceivedLandRequests() {
  const [receivedLandRequests, setReceivedLandRequests] = useState([]);
  const [landData, setLandData] = useState([]);

  const getMetamaskAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  };

  const fetchReceivedLandRequests = async (account) => {
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const result = await contract.methods.receivedLandRequests().call(
      { from: account, gas }
    );

    setReceivedLandRequests(result);
  };

  const getRequestStatus = async (requestId) => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    
    let Buyer_address;
    try {
        Buyer_address = await contract.methods
        .getBuyerAddressForRequest(requestId)
        .call({ from: account, gas });
    } catch (error) {
      console.error(error);
    }
    const status = await contract.methods.getLandRequestStatus(requestId,Buyer_address).call({ from: Buyer_address, gas });

    return status;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "0":
        return "Requested";
      case "1":
        return "Accepted";
      case "2":
        return "Rejected";
      case "3":
        return "Payment Done";
      case "4":
        return "Completed";
      default:
        return "Unknown";
    }
  };


  const getLandIdForRequest = async (requestId) => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const landId = await contract.methods.getLandIdForRequest(requestId).call(
      { from: account, gas }
    );

    return landId;
  };

  const fetchLandData = async () => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;

    const dataPromises = receivedLandRequests.map(async (requestId) => {
      const landId = await getLandIdForRequest(requestId);

      let landInfo;
      try {
        landInfo = await contract.methods
          .getBuyerAddressForRequest(requestId)
          .call({ from: account, gas });
      } catch (error) {
        console.error(error);
      }

      const status = await getRequestStatus(requestId.toString());
     

      return {
        requestId: requestId,
        landId: landId,
        landInfo: landInfo,
        status: status,
      };
    });
    const data = await Promise.all(dataPromises);
    setLandData(data);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const account = await getMetamaskAccount();
      const web3Instance = new Web3(window.ethereum);
      const contract = new web3Instance.eth.Contract(
        contractABI,
        landContractAddress
      );

      const gas = 2000000;
      

    // Check if the request has already been accepted
    const requestStatus = await getRequestStatus(requestId);
    const reqstatus= parseInt(requestStatus);

 
  if (reqstatus === 1) {
    alert("This request has already been accepted!");
    return;
  }

      // Call the smart contract function to accept the request
      await contract.methods.acceptRequest(requestId).send({
        from: account,
        gas,
      });

      alert("Request has been accepted!");
      // Update the local state or trigger a refetch of data as needed
      // For simplicity, let's refetch all data
      await fetchReceivedLandRequests(account);
      await fetchLandData();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleMarkPaymentAsDone = async (requestId) => {
    try {
      const account = await getMetamaskAccount();
      const web3Instance = new Web3(window.ethereum);
      const contract = new web3Instance.eth.Contract(
        contractABI,
        landContractAddress
      );

      const gas = 2000000;

      const landId = await contract.methods.getLandIdForRequest(requestId).call(
        { from: account, gas }
      );

      // Check if the request has been accepted
    const requestStatus = await getRequestStatus(requestId.toString());
    console.log(requestStatus.toString())
    const reqstatus= parseInt(requestStatus);
    console.log(reqstatus)
  

  if (reqstatus === 1) {
    console.log("hello")
    // Call the smart contract function to mark payment as done
    await contract.methods.markPaymentAsDone(requestId,landId).send({
        from: account,
        gas,
      });
      console.log("bye")
      alert("Payment has been marked as done!");

      // Update the local state or trigger a refetch of data as needed
      // For simplicity, let's refetch all data
      await fetchReceivedLandRequests(account);
      await fetchLandData();
  }
  else if(reqstatus === 3)
  {
    alert("The payment is  already marked as done!");
  }
  else
  {
    alert("The request has not yet been accepted!");
  }
  } catch (error) {
      console.error("Error marking payment as done:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const account = await getMetamaskAccount();
      const web3Instance = new Web3(window.ethereum);
      const contract = new web3Instance.eth.Contract(
        contractABI,
        landContractAddress
      );

      const gas = 2000000;

      const requestStatus = await getRequestStatus(requestId);
      const reqstatus= parseInt(requestStatus);
     

    if (reqstatus === 1) {
      alert("This request has already been accepted. You cannot reject it.");
    }
     else if(reqstatus === 3)
     {
        alert("This request has already been accepted and payment is done! You cannot reject it");
     }
     else
     {

      // Call the smart contract function to reject the request
      await contract.methods.rejectRequest(requestId).send({
        from: account,
        gas,
      });

      alert("Request has been rejected!");
      // Update the local state or trigger a refetch of data as needed
      // For simplicity, let's refetch all data
      await fetchReceivedLandRequests(account);
      await fetchLandData();
     }

    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        await fetchReceivedLandRequests(account);
        await fetchLandData();
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
      }
    } else {
      if (!window.ethereum) {
        console.error("Metamask not detected");
      } else {
        console.log("Already connected to Metamask");
      }
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    fetchLandData();
  }, [receivedLandRequests]);

  return (
    <>
      <Sidebar />
      <div className="sent-land-requests-container">
        <h1>Received Land Requests to sell</h1>
      {receivedLandRequests.length === 0 ? (
        <p>No received land requests!!</p>
      ) : (
        <div className="received-land-cards">
          {landData.map((item) => (
            <div key={item.requestId} className="sent-land-card">
              <p>Request ID: {item.requestId.toString()}</p>
              <p>Land ID: {item.landId.toString()}</p>
              <p>Buyer Address: {item.landInfo}</p>
              <p>Request Status: {getStatusLabel(item.status.toString())}</p>
              <button onClick={() => handleAcceptRequest(item.requestId)}>
                Accept
              </button>
              <button onClick={() => handleRejectRequest(item.requestId)}>
                Reject
              </button>
              <button onClick={() => handleMarkPaymentAsDone(item.requestId)}>
                Mark Payment as Done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default ReceivedLandRequests;
