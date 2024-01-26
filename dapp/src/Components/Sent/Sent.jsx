import React, { useEffect, useState } from "react";
import Web3 from "web3";
import configuration from "../../LandRegistration.json";
import Sidebar from "../Sidebar/Sidebar";
import "./Sent.css";

// const landContractAddress = "0xD4e46d45EAF564eb89C58e09D0A947dCd2e45008";
const contractABI = configuration.abi;

function SentLandRequests({landContractAddress}) {
  const [sentLandRequests, setSentLandRequests] = useState([]);
  const [landData, setLandData] = useState([]);

  const getMetamaskAccount = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  };

  const fetchSentLandRequests = async (account) => {
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;
    const result = await contract.methods.sentLandRequests().call(
      { from: account, gas }
    );

    setSentLandRequests(result);
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

  const fetchLandData = async () => {
    const account = await getMetamaskAccount();
    const web3Instance = new Web3(window.ethereum);
    const contract = new web3Instance.eth.Contract(
      contractABI,
      landContractAddress
    );

    const gas = 2000000;

    const dataPromises = (sentLandRequests.map(async (requestId) => {
      const landId = await getLandIdForRequest(requestId);

      let landInfo;
      try {
        landInfo = await contract.methods.getOwnerAddress(landId).call({ from: account, gas });

      } catch(error) {
        console.error(error)
      }

      const status = await getRequestStatus(requestId.toString());

      return {
        requestId: requestId,
        landId: landId,
        landInfo: landInfo,
        status: status,
      };
    }));
    const data = await Promise.all(dataPromises);
    setLandData(data);
  };

  const initPage = async () => {
    if (window.ethereum) {
      try {
        const account = await getMetamaskAccount();
        await fetchSentLandRequests(account);

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
  }, [sentLandRequests]);

  return (
    <>
      <Sidebar />
      <div className="sent-land-requests-container">
        <h1>Sent Land Requests to Buy</h1>
        {sentLandRequests.length === 0 ? (
          <p>No sent land requests!!</p>
        ) : (
          <div className="sent-land-cards">
            {landData.map((item) => (
              <div key={item.requestId} className="sent-land-card">
                <p className="land-details"><b>Request ID: </b>{item.requestId.toString()}</p>
                <p className="land-details"><b>Land ID: </b>{item.landId.toString()}</p>
                <p className="land-details"><b>Land Owner Address: </b>{item.landInfo}</p>
                <p className="land-details"><b>Request Status: </b>{getStatusLabel(item.status.toString())}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SentLandRequests;
