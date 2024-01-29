import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./home.css";

// const landContractAddress = "0x76017b4E9Fe30D5b2Ba7D345B8a42aC2b85C7978";
const contractABI = configuration.abi;

//Returns jsx which will display all lands owned by the user
function Home({landContractAddress}) {
  const [myLands, setMyLands] = useState([]);


    const getMetamaskAccount = async() => {
        // Request MetaMask account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return accounts[0];
    }

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

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        await fetchMyLands(account);
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
      }
    } else {
      if (!window.ethereum) {
        console.error("Metamask not detected");
      } else {
        console.log("Already connected to metamask");
      }
    }
  };

  const fetchMyLands = async (account) => {
    // Create a Web3 instance using the provider from MetaMask
    const web3Instance = new Web3(window.ethereum);

    // Connect to your contract using the Web3 instance
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    // Call the getMyLands function on the contract
    const result = await contract.methods
      .getMyLands()
      .call({ from: account, gas });
    setMyLands(result);
    console.log(result);
  };

  const listLandForSale = async (landId) => {
    const account = await getMetamaskAccount();

    console.log("listLandForSale called: " + landId.toString());
    const web3Instance = new Web3(window.ethereum);
    const gas = 2000000;

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );
    try {
      const transaction = await contract.methods
        .listLandForSale(landId)
        .send({ from: account,gas });
      const transactionEvents = transaction.events;
      if (transactionEvents.LandListedForSale) {
        alert("Land listed for sale.");
      } else if(transactionEvents.LandAlreadyForSale) {
        alert("Land has already been listed for sale.")
      }
      else {
        console.error("No event emitted.");
        alert("No event emitted.");
      }
      console.log(transaction.events);
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  }

  const requestLandVerification = async (landId) => {
    const account = await getMetamaskAccount();

    const web3Instance = new Web3(window.ethereum);

    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    // Call the getMyLands function on the contract
    const transaction = await contract.methods.landVerificationRequest(landId).send({ from: account, gas });

    const events = transaction.events;

    if(events.LandVerificationRequestExists) {
      alert("Land Verification has already been requested!");
    } else if(events.LandVerificationRequestSubmitted) {
      alert("Land verification request submitted!");
    } else {
      alert("An error has occured. Check console for detailed error")
      console.error(transaction)
    }
  }

  useEffect(() => {
    initPage();
  }, []);

    return <>
        <Sidebar />
          
          { myLands.length === 0 ? (<div className="card-container"><p>No Lands to show</p></div>) :
          ( <div className="card-container">
            { myLands.map((land, index) => (
          <div className="card" key={index}>
              <p className="card-title">LAND {index + 1}</p>
              <p className="land-details"><b>Land Id: </b> {land.landId.toString()}</p>
              {/* Land Owner Address */}
              <p className="land-details"><b>Land Owner Address:</b> {land.owner}</p>
              <p className="land-details"><b>State: </b>{land.identifier.state}</p>
              <p className="land-details"><b>Division:</b> {land.identifier.division}</p>
              <p className="land-details"><b>District:</b> {land.identifier.district}</p>
              <p className="land-details"><b>Taluka: </b>{land.identifier.taluka}</p>
              <p className="land-details"><b>Village: </b> {land.identifier.village}</p>
              <p className="land-details"><b>Survery Number: </b>{land.identifier.surveyNumber.toString()}</p>
              <p className="land-details"><b>Subdivision:</b> {land.identifier.subdivision}</p>
              <p className="land-details"><b>Area:</b> {land.area.toString()}</p>
              <p className="land-details"><b>Purchase Date:</b> {land.purchaseDate.toString()}</p>
              <p className="land-details"><b>Purchase Price:</b> {land.purchasePrice.toString()}</p>                
              <p className="land-details"><b>Land Value at Purchase:</b> {land.landValueAtPurchase.toString()}</p>
              <p className="land-details"><b>Land Verified:</b> {land.isVerified.toString()}</p>
              <p className="land-details"><b>Land for sale:</b> {land.isForSale.toString()}</p>
              <p className="land-details"><b>
                Previous Owner Address:</b>
               {land.previousOwners.length > 0
                ? land.previousOwners.join(", ")
                : " No Previous Owners"}
              </p>
              {(!land.isForSale) && <button className="submit-list" 
                onClick={() => {listLandForSale(land.landId)}}>List Land for Sale</button>}
              {(!land.isVerified) && <button className="submit-list" 
                onClick={() => {requestLandVerification(land.landId)}}>Request Land Verification</button>}
          </div>
          )) } </div>)}
    </>
  }


export default Home;
