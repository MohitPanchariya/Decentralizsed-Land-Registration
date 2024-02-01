import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import "./Transfer.css";

// const landContractAddress ="0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
const contractABI = configuration.abi;

function TransferRequests({landContractAddress}) {
  const [pendingTransferRequests, setPendingTransferRequests] = useState([]);
  const [landData, setLandData] = useState([]);
 


  const getMetamaskAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  };

  const fetchReceivedTransferRequests = async (account) => {
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const result = await contract.methods.getPendingTransferRequests().call(
      { from: account, gas }
    );

    setPendingTransferRequests(result);
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

    const dataPromises = pendingTransferRequests.map(async (requestId) => {
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
  

      if(reqstatus === 3) {
        alert("Transfer of ownership is done!");
       }

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
        await fetchReceivedTransferRequests(account);
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
  }, [pendingTransferRequests]);

  return (
    <>
    <div className="sent-land-requests-container">
      <SidebarAdmin />
      <h1>Transfer Of Ownership Requests</h1>
      {landData.length === 0 ? (
        <p>No land transfer requests found!</p>
      ) : (
        <div className="received-land-cards">
          {landData.map((item) => (
            // Check if the status is "Payment Done"
            (item.status.toString() === "3" || item.status.toString() === "4") && (
              <div key={item.requestId} className="sent-land-card">
                <p className="land-details">
                  <b>Request ID: </b>
                  {item.requestId.toString()}
                </p>
                <p className="land-details">
                  <b>Land ID: </b>
                  {item.landId.toString()}
                </p>
                {/* Conditionally render Buyer Address based on transfer status */}
                  <p className="land-details">
                    <b>Buyer Address: </b>
                    {item.BuyerInfo}
                  </p>
                <p className="land-details">
                  <b>Land Owner Address: </b>
                  {item.SellerInfo}
                </p>
                <p className="land-details">
                  <b>
                    Previous Owner Address:{" "}
                  </b>
                  {item.previousOwners.length > 0
                    ? item.previousOwners[0].length > 0
                      ? item.previousOwners[0].join(", ")
                      : "No Previous Owners"
                    : "No Previous Owners"}
                </p>
                <p className="land-details">
                  <b>Request Status: </b>
                  {getStatusLabel(item.status.toString())}
                </p>
                <button className="transfer-button"onClick={() => transferOwnership(item.requestId)}>
          TRANSFER OWNERSHIP
        </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  </>
  );
}

export default TransferRequests;
