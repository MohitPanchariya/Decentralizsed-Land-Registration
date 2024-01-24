import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./LandsForSale.css";

const landContractAddress = "0x76017b4E9Fe30D5b2Ba7D345B8a42aC2b85C7978";
const contractABI = configuration.abi;

function LandsForSale() {
  const [landsForSale, setLandsForSale] = useState([]);
  const [requestedLands, setRequestedLands] = useState([]);
  const [landStates, setLandStates] = useState({});

  const getMetamaskAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
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
  const fetchLandsForSale = async (account) => {
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const result = await contract.methods.getLandsForSale().call(
      { from: account, gas }
    );
    return result;
  };

  const getRequestStatus = async (requestId) => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const status = await contract.methods.getLandRequestStatus(requestId, account).call({ from: account, gas });

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

  const fetchRequestedLands = async (account) => {
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const result = await contract.methods.sentLandRequests().call(
      { from: account, gas }
    );
    console.log(result)
    return result;
  };

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        const result = await fetchLandsForSale(account);
        setLandsForSale(result);

        const requestedResult = await fetchRequestedLands(account);
        setRequestedLands(requestedResult);

        const initialLandStates = {};
        result.forEach((land) => {
        initialLandStates[land.landId] = requestedResult.includes(land.landId);
        });
        setLandStates(initialLandStates);
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
      }
    } else {
      console.error("Metamask not detected");
    }
  };

  const requestForBuy = async (landId) => {
    const account = await getMetamaskAccount();
    const gas = 2000000;
    const web3Instance = new Web3(window.ethereum);

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );
    try {
      const transaction = await contract.methods.requestForBuy(landId).send(
        { from: account, gas }
      );
      const transactionEvents = transaction.events;
      if (transactionEvents.LandRequests) {
        alert("Request is sent!!");
        setRequestedLands((prevRequested) => [...prevRequested, landId]);
       
  

        // Update the state for the specific land
        setLandStates((prevStates) => ({
          ...prevStates,
          [landId]: true,
        }));
      } else if (transactionEvents.DuplicateLandRequest) {
        alert("Request is already sent!");
      }
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  };

  const getRequestIdForLand = async (landId) => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const requestId = await contract.methods.getRequestForLandId(landId,account).call(
      { from: account, gas }
    );

    return requestId;
  };

  const cancelBuyerRequest = async (landId) => {
    const account = await getMetamaskAccount();
    const gas = 2000000;
    const web3Instance = new Web3(window.ethereum);

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );
    try {
      const requestId = await  getRequestIdForLand(landId);
      const requestStatus = await getRequestStatus(requestId);
      const reqstatus= parseInt(requestStatus);
      console.log(reqstatus)
     

    if (reqstatus === 1 || reqstatus === 3 ) {
      alert("This request has been accepted by the land owner!! You cannot cancel.");
      return;
    }
      const transaction = await contract.methods.cancelBuyerRequest(landId).send(
        { from: account, gas }
      );
      const transactionEvents = transaction.events;

      if (transactionEvents.BuyerRequestCancelled) {
        alert("Cancellation is done!");

        // Remove the landId from requestedLands state after cancellation
        setRequestedLands(requestedLands.filter((id) => id !== landId));

        // Update the state for the specific land
        setLandStates((prevStates) => ({
          ...prevStates,
          [landId]: false,
        }));
      }
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  };

  useEffect(() => {
    initPage();
  }, []);



    return <>
        <Sidebar />
        <div className="card-container">
            { landsForSale.map((land, index) => (
            <div className="card" key={index}>
                <h3>LAND {index + 1}</h3>
                <p className="land-details" ><b>Land Id:</b> {land.landId.toString()}</p>
                {/* Land Owner Address */}
                <p  className="land-details"><b>Land Owner Address:</b> {land.owner}</p>
                <p  className="land-details"><b>State:</b> {land.identifier.state}</p>
                <p  className="land-details"><b>Division:</b> {land.identifier.division}</p>
                <p  className="land-details"><b>District:</b> {land.identifier.district}</p>
                <p  className="land-details"><b>Taluka: </b>{land.identifier.taluka}</p>
                <p  className="land-details"><b>Village:</b> {land.identifier.village}</p>
                <p  className="land-details"><b>Survery Number: </b>{land.identifier.surveyNumber.toString()}</p>
                <p  className="land-details"><b>Subdivision:</b> {land.identifier.subdivision}</p>
                <p  className="land-details"><b>Area: </b>{land.area.toString()}</p>
                <p  className="land-details"><b>Purchase Date: </b>{land.purchaseDate.toString()}</p>
                <p  className="land-details"><b>Purchase Price: </b>{land.purchasePrice.toString()}</p>
                <p  className="land-details"><b>Land Value at Purchase: </b>{land.landValueAtPurchase.toString()}</p>
                <p  className="land-details"><b>Land Verified:</b> {land.isVerified.toString()}</p>
                <p  className="land-details"><b>Land for sale:</b> {land.isForSale.toString()}</p>
                <p className = "land-details">
                Previous Owner Address:
                {land.previousOwners.length > 0
                  ? land.previousOwners.join(", ")
                  : "No Previous Owners"}
                </p>
                {landStates[land.landId] ? (
                  <button onClick={() => { cancelBuyerRequest(land.landId) }}>
                    Cancel Buy Request
                  </button>
                ) : (
                  <button onClick={() => { requestForBuy(land.landId) }}>
                    Request for Buy
                  </button>
                )}
            </div>
            )) }
        </div>
    </>
    
}

export default LandsForSale;

