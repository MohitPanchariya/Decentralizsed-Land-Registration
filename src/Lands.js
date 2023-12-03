const landRecordsList = document.getElementById('land-records-list');
const landsForSaleList = document.getElementById('lands-for-sale-list');
const myLandsList = document.getElementById('my-lands-list');
const receivedRequestsList = document.getElementById('received-requests-list');
const sentRequestsList = document.getElementById('sent-requests-list');


const abi =
[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_accountRegistrationContract",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "LandRecordAdded",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "landId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "LandRecordExists",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "landId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "struct LandRegistration.LandRecord",
          "name": "_record",
          "type": "tuple"
        }
      ],
      "name": "addLandRecord",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "allLandList",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deployer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_landId",
          "type": "uint256"
        }
      ],
      "name": "getLandId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_landId",
          "type": "uint256"
        }
      ],
      "name": "landVerificationRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_landId",
          "type": "uint256"
        }
      ],
      "name": "listLandForSale",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_requestId",
          "type": "uint256"
        },
        {
          "internalType": "struct LandRegistration.LandIdentifier",
          "name": "documentUrl",
          "type": "tuple"
        }
      ],
      "name": "transferLandOwnership",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "verificationRequired",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]
  

// Connect to the smart contract
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const contractAddress = '0x3CE4DE73fFF52084CD1d05b813a5999065B5158A'; // Replace with your contract address
const landContract = new web3.eth.Contract(abi, contractAddress);
const requestBuyButton = document.getElementById('request-buy-button');
const buyerRequestsList = document.getElementById('buyer-requests-list');
const sellerRequestsList = document.getElementById('seller-requests-list');

// Get land records
landContract.methods.ReturnAllLandList().call().then(landIds => {
    for (const landId of landIds) {
        landContract.methods.getLandId(landId).call().then(landRecord => {
            const landRecordElement = document.createElement('li');
            landRecordElement.classList.add('land-record');
            landRecordElement.innerHTML = `
                <div class="land-record-identifier">
                    <strong>Land Identifier:</strong> ${landRecord.identifier.state} - ${landRecord.identifier.division} - ${landRecord.identifier.district} - ${landRecord.identifier.taluka} - ${landRecord.identifier.village} - ${landRecord.identifier.surveyNumber} - ${landRecord.identifier.subdivision}
                </div>
                <div class="land-record-details">
                    <span>Owner:</span> ${landRecord.owner}
                    <span>Area:</span> ${landRecord.area}
                    <span>Purchase Date:</span> ${landRecord.purchaseDate}
                    <span>Purchase Price:</span> ${landRecord.purchasePrice}
                </div>
            `;
            landRecordsList.appendChild(landRecordElement);
        });
    }

});
// Get buyer requests
landContract.methods.getLandsForSale().call().then(landIds => {
    for (const landId of landIds) {
        landContract.methods.getLandId(landId).call().then(landRecord => {
            const requestElement = document.createElement('li');
            requestElement.innerHTML = `
                <strong>Land ID:</strong> ${landId}
                <br>
                <strong>Seller:</strong> <span class="math-inline">\{landRecord\.owner\}
<br\>
<button id\="request\-buy\-</span>{landId}">Request to Buy</button>
            `;

            buyerRequestsList.appendChild(requestElement);

            // Add event listener for request to buy button
            const requestBuyButton = document.getElementById(`request-buy-${landId}`);
            requestBuyButton.addEventListener('click', () => {
                landContract.methods.requestForBuy(landId).call().then(() => {
                    alert('Request to buy land submitted successfully!');
                });
            });
        });
    }
});

// Get buyer requests
landContract.methods.receivedLandRequests().call().then(requestIds => {
    for (const requestId of requestIds) {
        landContract.methods.getLandRequest(requestId).call().then(landRequest => {
            const requestElement = document.createElement('li');
            requestElement.innerHTML = `
                <strong>Request ID:</strong> ${requestId}
                <br>
                <strong>Land ID:</strong> ${landRequest.landId}
                <br>
                <strong>Buyer:</strong> ${landRequest.buyerId}
                <br>
                <strong>Seller:</strong> ${landRequest.sellerId}
                <br>
                <strong>Status:</strong> ${landRequest.requestStatus}

            `;

            // Check if the current user is the seller of the land
            if (landRequest.sellerId === web3.eth.accounts[0]) {
                requestElement.innerHTML += `
                    <br>
                    <button id="accept-request-${requestId}">Accept Request</button>
                    <button id="reject-request-${requestId}">Reject Request</button>
                `;

                // Add event listeners for accept and reject buttons
                const acceptRequestButton = document.getElementById(`accept-request-${requestId}`);
                acceptRequestButton.addEventListener('click', () => {
                    landContract.methods.acceptRequest(requestId).call().then(() => {
                        alert('Request accepted successfully!');
                        updateRequestStatus(requestId, 'Accepted');
                    });
                });

                const rejectRequestButton = document.getElementById(`reject-request-${requestId}`);
                rejectRequestButton.addEventListener('click', () => {
                    landContract.methods.rejectRequest(requestId).call().then(() => {
                        alert('Request rejected successfully!');
                        updateRequestStatus(requestId, 'Rejected');
                    });
                });
            }

            // Append the request element to the appropriate list
            if (landRequest.sellerId === web3.eth.accounts[0]) {
                sellerRequestsList.appendChild(requestElement);
            } else {
                buyerRequestsList.appendChild(requestElement);
            }
        });
    }
});

// Function to update the request status in the front-end
function updateRequestStatus(requestId, newStatus) {
    const requestElement = document.getElementById(`request-${requestId}`);
    const statusElement = requestElement.querySelector('strong');
    statusElement.textContent = `Status: ${newStatus}`;
}

  // Get button and input elements
  const transferOwnershipButton = document.getElementById('transfer-ownership-button');
  const requestIdInput = document.getElementById('request-id');
  const documentUrlInput = document.getElementById('document-url');

  // Event listener for the "Transfer Ownership" button
  transferOwnershipButton.addEventListener('click', async () => {
      const requestId = requestIdInput.value;
      const documentUrl = documentUrlInput.value;

      // Call the transferLandOwnership function
      await landContract.methods.transferLandOwnership(requestId, documentUrl).send({ from: 'YOUR_SENDER_ADDRESS' })
          .then((result) => {
              console.log('Transaction Result:', result);
              alert('Land ownership transferred successfully!');
          })
          .catch((error) => {
              console.error('Error:', error);
              alert('Error transferring land ownership. Please check the console for details.');
          });
  });