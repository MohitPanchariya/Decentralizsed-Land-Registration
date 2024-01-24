import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./home.css";

const landContractAddress = "0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
const contractABI = configuration.abi;

//Returns jsx which will display all lands owned by the user
function Home() {
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
                console.error('Error connecting to Metamask:', error);
            }
        } else {
          if(!window.ethereum) {
            console.error("Metamask not detected")
          } else {
            console.log("Already connected to metamask")
          }
        }
    };

    const fetchMyLands = async(account) => {
        // Create a Web3 instance using the provider from MetaMask
        const web3Instance = new Web3(window.ethereum);

        // Connect to your contract using the Web3 instance
        const contract = new web3Instance.eth.Contract(
            contractABI,
            landContractAddress
        );

        const gas = 2000000; 
        // Call the getMyLands function on the contract
        const result = await contract.methods.getMyLands().call(
            {from: account, gas}
        );
        setMyLands(result);
        console.log(result);
    }

    const listLandForSale = async(landId) => {

        const account = await getMetamaskAccount();

        console.log("listLandForSale called: " + landId.toString());
        const web3Instance = new Web3(window.ethereum);

        const contract = new web3Instance.eth.Contract(
          contractABI,
          landContractAddress
        );
        try {
            const transaction = await contract.methods.listLandForSale(landId).send(
                {from: account}
            );
            const transactionEvents = transaction.events;
            if(transactionEvents.LandListedForSale) {
                alert("Land listed for sale.")
            } else {
                console.error("No event emitted.")
                alert("No event emitted.")
            }
            console.log(transaction.events)
        } catch (error) {
            console.error(error)
            alert("Transaction failed.")
        }
    }

    

    useEffect(() => {
        initPage();
    }, [])

    return <>
           <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <div className="card-container">
            { myLands.map((land, index) => (
            <div className="card" key={index}>
                <h3>Land {index + 1}</h3>
                <p>Land Id: {land.landId.toString()}</p>
                {/* Land Owner Address */}
                <p>Land Owner Address: {land.owner}</p>
                <p>State: {land.identifier.state}</p>
                <p>Division: {land.identifier.division}</p>
                <p>District: {land.identifier.district}</p>
                <p>Taluka: {land.identifier.taluka}</p>
                <p>Village: {land.identifier.village}</p>
                <p>Survery Number: {land.identifier.surveyNumber.toString()}</p>
                <p>Subdivision: {land.identifier.subdivision}</p>
                <p>Area: {land.area.toString()}</p>
                <p>Purchase Date: {land.purchaseDate.toString()}</p>
                <p>Purchase Price: {land.purchasePrice.toString()}</p>                
                <p>Land Value at Purchase: {land.landValueAtPurchase.toString()}</p>
                <p>Land Verified: {land.isVerified.toString()}</p>
                <p>Land for sale: {land.isForSale.toString()}</p>
                <p>
                Previous Owner Address:
                {land.previousOwners.length > 0
                  ? land.previousOwners.join(", ")
                  : "No Previous Owners"}
                </p>
                <button onClick={() => {listLandForSale(land.landId)}}>List Land for Sale</button>
              
            </div>
            )) }
        </div>
    </>
}

export default Home