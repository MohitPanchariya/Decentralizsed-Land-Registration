import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./TOO.css";

const landContractAddress ="0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
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

  const getPreviousOwners = async (landId) => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const owners = await contract.methods.getPreviousOwners(landId).call(
      { from: account, gas }
    );

    return owners;
  }

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

      let BuyerInfo;
      try {
        BuyerInfo = await contract.methods
          .getBuyerAddressForRequest(requestId)
          .call({ from: account, gas });
      } catch (error) {
        console.error(error);
      }

      let SellerInfo;
      try {
        SellerInfo = await contract.methods
          .getOwnerAddress(landId)
          .call({ from: account, gas });
      } catch (error) {
        console.error(error);
      }

      let previousOwners = [];
      try {
        previousOwners.push(await contract.methods
          .getPreviousOwners(landId)
          .call({ from: account, gas }));
      } catch (error) {
        console.error(error);
      }
      


      const status = await getRequestStatus(requestId.toString());
     

      return {
        requestId: requestId,
        landId: landId,
        BuyerInfo: BuyerInfo,
        SellerInfo : SellerInfo,
        status: status,
        previousOwners : previousOwners,
      };
    });
    const data = await Promise.all(dataPromises);
    setLandData(data);
  };

  const transferOwnership = async (requestId) => {
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

 
       if (reqstatus === 4) {
         alert("This request has been completed.Ownership is transferred!!");
         return;
       }

    try {
      const transaction = await contract.methods.transferLandOwnership(requestId).send(
        {   from: account,
            gas, }
      );
      console.log("hello")

      // Handle the transaction success
      console.log(transaction);

      // You may want to update the UI or perform additional actions on success
    } catch (error) {
      // Handle the transaction failure
      console.error(error);

      // You may want to display an error message to the user
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
        <h1>Transfer Of Ownership</h1>

        <div className="received-land-cards">
          {landData.map((item) => (
            // Check if the status is "Payment Done"
  (item.status.toString() === "3" || item.status.toString() === "4")  && (
    <div key={item.requestId} className="sent-land-card">
      <p>Request ID: {item.requestId.toString()}</p>
      <p>Land ID: {item.landId.toString()}</p>
      <p>Buyer Address: {item.BuyerInfo}</p>
      <p>Land Owner Address: {item.SellerInfo}</p>
      <p>
                Previous Owner Address:
                {item.previousOwners.length > 0
                  ? item.previousOwners.join(", ")
                  : "No Previous Owners"}
                </p>
      <p>Request Status: {getStatusLabel(item.status.toString())}</p>
      <button onClick={() => transferOwnership(item.requestId)}>
        Transfer Ownership
      </button>
    </div>
  )
          ))}
        </div>
      
    </div>
    </>
  );
}

export default ReceivedLandRequests;
