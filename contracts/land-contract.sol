// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./registerAccount-contract.sol";

interface IAccountRegistration {
    function checkUserVerified(address _account) external returns (bool);
    function isLandInspector(address _account) external returns (bool);
}

contract LandRegistration {

    //Address which deployed this smart contract
    address public deployer;
    //AccountRegistration Contract
    address public accountRegistrationContract;

    constructor(address _accountRegistrationContract) {
        deployer = msg.sender;
        accountRegistrationContract = _accountRegistrationContract;
    }

    struct LandIdentifier {
        /*
            Fields needed to identify the piece of land
            A state has divisions.
            Each division has districts.
            Each district has talukas.
            Each taluka has villages.
            A land parcel under this hierarchy is identified using
            a survey number.
            Shall this land be divided at a later point, its sub-divisions
            are represented using a sub-division number.
            All divisions in Maharashtra can be found in the link below:
            http://www.landsofmaharashtra.com/divisionsofmaharashtra.html 
        */
        string state;
        string division;
        string district;
        string taluka;
        string village;
        uint surveyNumber;
        string subdivision;
    }

    struct LandRecord {
        uint landId;
        //Address of the account(person) that owns this piece of land
        /* 
            Note: There can be multiple owners of a single piece of land.
            This is being ignored for now.
        */
        address owner;

        LandIdentifier identifier;

        uint area;

        //Represented as UNIX Time
        uint purchaseDate;
        //Price at which the land was purchased.
        uint purchasePrice;
        //Estimated value of land at the time of purchase
        uint landValueAtPurchase;

        //A list of the previous owners of this piece of land. 
        address[] previousOwners;

        /*
            If a piece of land is entering the system for the first time,
            it must be verified by an inspector.
        */
        bool isVerified;
        bool isForSale;
    }

    //Event to be emitted after adding a land record
    event LandRecordAdded(uint landId);
    //Event to be emitted if the land record already exists
    event LandRecordExists(uint landId);
    //Event to be emitted when land is listed for sale
    event LandListedForSale(uint landId);

    event LandRequests(uint requestId, address landOwner, address buyer, uint landId, reqStatus status, bool someFlag);
    event LandRequestCancelled(uint requestId);
    event PaymentMarkedAsDone(uint requestId, uint landId);
    event LandOwnershipTransferred(uint landId, address oldOwner, address newOwner);

    //Event to be emitted after land verification request has been sent
    event LandVerificationRequestSubmitted (uint landId);
    //Event to be emitted if land verification request already exists
    event LandVerificationRequestExists (uint landId);
    //Event to be emitted if land is already verified
    event LandAlreadyVerified (uint landId);
    //Event to be emitted when the land is verified by an inspector
    event LandVerified(uint landId);

     // Event to be emitted when a user tries to request to buy the same land twice
    event DuplicateLandRequest(uint landId, address buyer);

       // Event to be emitted when a buyer cancels their request to buy a land
    event BuyerRequestCancelled(uint requestId, address seller, address buyer, uint landId);

    // Event to be emitted when a buyer tries to cancel the same request more than once
    event DuplicateCancellationAttempt(address buyer, uint landId);

    // Declare an event for acceptance of a request
event RequestAccepted(uint indexed requestId, address indexed seller, address indexed buyer);
// Declare an event for rejection of a request
event RequestRejected(uint indexed requestId, address indexed seller, address indexed buyer);

//A structure that represents the Land requests made by buyer to seller along with the status of the request
     struct LandRequest {
        uint reqId;
        address sellerId;
        address buyerId;
        uint landId;
        reqStatus requestStatus;
        bool isPaymentDone;
    }

    //An enumeration that shows different stages of the request
    enum reqStatus {requested,accepted,rejected,paymentdone,completed}


//Mapping to different lists and LandRequest
    mapping(uint => LandRequest) public LandRequestMapping;
    mapping(address => uint[])  MyReceivedLandRequests;
    mapping(address => uint[])  MySentLandRequests;
    mapping(address => uint[])  MyLands;

// A mapping between land ID, buyer address, and request ID
    mapping(uint => mapping(address => uint)) public landToBuyerToRequest;
    
    //List containing all the lands that are added
    uint[] allLandList;

    

    uint256 requestCount;


    uint public landRecordsCount = 1;

    modifier onlyOwner(uint _landId) {
        require(
            msg.sender == landMapping[_landId].owner,
            "Only owner can perform this operation."
        );
        _;
    }

    modifier onlylInspector() {
        //Call the isInspector function from the accountRegistration contract
        bool isInspector = IAccountRegistration(
            accountRegistrationContract
        ).isLandInspector(msg.sender);

        require(isInspector, "Only inspector can perform this action.");
        _;
    }

    modifier onlyRegisteredUser() {
        //Call the isVerified function from the accountRegistration contract
        bool isRegisteredUser = IAccountRegistration(
            accountRegistrationContract
        ).checkUserVerified(msg.sender);

        require(isRegisteredUser, "Only registered user can perform this action.");
        _;
    }

    modifier onlyVerifiedLand(uint _landId) {
        require(
            landMapping[_landId].isVerified == true,
            "Only verified lands can be put up for sale."
        );
        _;
    }

    /*
        Mapping of land records by hierarchy. Mapping is as follows:
        state => {
            division => {
                district => {
                    taluka => {
                        village => {
                            survery number => {
                                subdivision => id
                            }
                        }
                    }
                }
            }
        }
        This mapping will be useful for efficient retrieval of land id.
     */
    
    mapping(
        string => mapping(
            string => mapping(
                string => mapping(
                    string => mapping(
                        string => mapping(
                            uint => mapping(
                                string => uint
                            )
                        )
                    )
                )
            )
        )
    )landMapToId;

    //Mapping of land ids to land records.
    mapping(uint => LandRecord) public landMapping;

    //A list of land ids which have been marked for sale
    uint[] landsForSale;

    //A list of lands which are to be verified by an inspector
    uint[] verificationRequired;

    //Function to submit a land verification request
    function landVerificationRequest(uint _landId) public onlyRegisteredUser() onlyOwner(_landId) {
        //Land is already verified
        if(landMapping[_landId].isVerified) {
            emit LandAlreadyVerified(_landId);
            return;
        } 
        //Check if land verification request already exists.
        for(uint i = 0; i < verificationRequired.length; i++) {
            if(verificationRequired[i] == _landId) {
                emit LandVerificationRequestExists(_landId);
                return;
            }
        }
        //Add request to the list of pending verifications
        verificationRequired.push(_landId);
        emit LandVerificationRequestSubmitted(_landId);
    }

    function getPendingLandVerificationRequests() public view returns (uint[] memory){
        return verificationRequired;
    }

    function landRecordExists(LandIdentifier memory _record) 
                                private view returns (bool, uint) {
        uint landId = landMapToId[_record.state][_record.division]
                                [_record.district][_record.taluka]
                                [_record.village][_record.surveyNumber][_record.subdivision];
        if (landId == 0) {
            return (false, 0);
        }
        return (true, landId);
    }

    //This function is used to add a land record
    function addLandRecord  (LandRecord memory _record) public 
                             returns (uint) {

        (bool recordExists, uint landId) = landRecordExists(_record.identifier);

        //If land record already exists, return the land id
        if (recordExists) {
            emit LandRecordExists(landId);
            return landId;
        }

        _record.landId = landRecordsCount;
        _record.isVerified = false;
        _record.isForSale = false;
        //If the land record doesn't already exist, add it to the mapping
        //and return land id
        landMapping[landRecordsCount] = _record;

        //Also add it to the landMapToId mapping
        landMapToId[_record.identifier.state][_record.identifier.division]
        [_record.identifier.district][_record.identifier.taluka]
        [_record.identifier.village][_record.identifier.surveyNumber]
        [_record.identifier.subdivision] = landRecordsCount;

        uint addedLandId = landRecordsCount;
        allLandList.push(addedLandId);
        landRecordsCount++;

        //Add to the accounts list of lands
        MyLands[msg.sender].push(addedLandId);
        emit LandRecordAdded(addedLandId);
        return addedLandId;
    }

    // Function to remove land by landId
    function removeLand(uint256 landId) public{
        uint256[] storage lands = MyLands[msg.sender];

        // Search for the landId in the array
        for (uint256 i = 0; i < lands.length; i++) {
            if (lands[i] == landId) {
                // Remove the landId from the array
                lands[i] = lands[lands.length - 1];
                lands.pop();


                break;
            }
        }
    }
    

    //Get land id
    function getLandId(LandIdentifier memory _identifier) public view returns (uint){
        return landMapToId[_identifier.state][_identifier.division]
        [_identifier.district][_identifier.taluka][_identifier.village]
        [_identifier.surveyNumber][_identifier.subdivision];
    }

    //Function to approve a land verification request
    function verifyLand(uint _landId) public onlylInspector {
        //Set the status of the land to verified
        landMapping[_landId].isVerified = true;

        //Remove land id from the verificationRequired list
        for(uint i = 0; i < verificationRequired.length; i++) {
            if(verificationRequired[i] == _landId) {
                verificationRequired[i] = verificationRequired[verificationRequired.length - 1];
                verificationRequired.pop();
                break;
            }
        }
        emit LandVerified(_landId);
    }

    //List land for sale
    function listLandForSale(uint _landId) public onlyRegisteredUser() onlyVerifiedLand(_landId) onlyOwner(_landId) {
        //Check if land actually exists
        //Mapping in solidity always exists and maps to a zero value
        //Hence, this check is needed.
        require(landMapping[_landId].landId > 0);

        //Mark the land for Sale
        landMapping[_landId].isForSale = true;

        //Add the land to the landsForSale list
        landsForSale.push(_landId);

        emit LandListedForSale(_landId);
    }

 // Function where a buyer can request and show interest in buying a land
    function requestForBuy(uint _landId) public  {
        require(landMapping[_landId].isForSale, "Land is not for sale");

        // Check if the buyer has already requested to buy this land before
        if (hasBuyerAlreadyRequested(_landId, msg.sender)) {
            // Emit the DuplicateLandRequest event and revert the transaction
            emit DuplicateLandRequest(_landId, msg.sender);
        }
        else
        {

        requestCount++;
        LandRequestMapping[requestCount] = LandRequest(requestCount, landMapping[_landId].owner, msg.sender, _landId, reqStatus.requested, false);
        MyReceivedLandRequests[landMapping[_landId].owner].push(requestCount);
        MySentLandRequests[msg.sender].push(requestCount);

        // Update the mapping between land ID, buyer address, and request ID
        landToBuyerToRequest[_landId][msg.sender] = requestCount;

        emit LandRequests(requestCount, landMapping[_landId].owner, msg.sender, _landId, reqStatus.requested, false);
        }
    }

    
    // Function to check if a buyer has already requested to buy a specific land
    function hasBuyerAlreadyRequested(uint _landId, address _buyer) internal view returns (bool) {
        return landToBuyerToRequest[_landId][_buyer] > 0;
    }

    // Function to cancel a buyer's request for a land
function cancelBuyerRequest(uint _landId) public  {
    require(landMapping[_landId].isForSale, "Land is not for sale");

        // Check if the buyer has requested for this land
        if (hasBuyerAlreadyRequested(_landId, msg.sender)) {
            uint requestId = landToBuyerToRequest[_landId][msg.sender];

            // // Check if the request is still in the 'requested' status
             require(LandRequestMapping[requestId].requestStatus == reqStatus.requested, "Cannot cancel. Request is not in 'requested' status");


            LandRequestMapping[requestId].requestStatus == reqStatus.rejected;

            // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
            removeRequestFromList(MyReceivedLandRequests[landMapping[_landId].owner], requestId);
            removeRequestFromList(MySentLandRequests[msg.sender], requestId);

            // Update the mapping between land ID, buyer address, and request ID
            delete landToBuyerToRequest[_landId][msg.sender];

            // Emit the BuyerRequestCancelled event
             emit BuyerRequestCancelled(requestId, landMapping[_landId].owner, msg.sender, _landId);
            }

}

// Add a new function to retrieve the status of land requests for a specific land
function getLandRequestStatus(uint _landId, address _buyer) public view returns (reqStatus) {
    uint requestId = landToBuyerToRequest[_landId][_buyer];
    if (requestId > 0) {
        return LandRequestMapping[requestId].requestStatus;
    }
    return reqStatus.requested; // Default to requested if no request found
}

// Internal function to remove a request ID from a list
function removeRequestFromList(uint[] storage requestList, uint requestId) internal {
    uint len = requestList.length;
    for (uint i = 0; i < len; i++) {
        if (requestList[i] == requestId) {
            requestList[i] = requestList[len - 1];
            requestList.pop();
            break;
        }
    }

    // Emit the LandRequestCancelled event
        emit LandRequestCancelled(requestId);
}

// Function that will return a list of received land requests buyers interested for a particular land
function receivedLandRequests() public view returns (uint[] memory) {
    
    return MyReceivedLandRequests[msg.sender];
}
//Function that will return a list of buyers interested for a particular land and have sent requests
function sentLandRequests() public view returns(uint[] memory)
{
    return MySentLandRequests[msg.sender];
}

// Add a new function to get land ID for a given request ID
function getLandIdForRequest(uint _requestId) public view returns (uint) {
    return LandRequestMapping[_requestId].landId;
}


// Function to get the buyer address for a given request ID
function getBuyerAddressForRequest(uint _requestId) public view returns (address) {
    require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");

    return LandRequestMapping[_requestId].buyerId;
}

// Function where seller accepts the request of the buyer
    function acceptRequest(uint _requestId) public {
        require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
        require(LandRequestMapping[_requestId].requestStatus == reqStatus.requested, "Invalid request status");

        // Update the request status
        LandRequestMapping[_requestId].requestStatus = reqStatus.accepted;
   
    }

//Function where seller rejects the request of the buyer
    function rejectRequest(uint _requestId) public 
    {
        require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
        require(LandRequestMapping[_requestId].requestStatus == reqStatus.requested, "Invalid request status");

        LandRequestMapping[_requestId].requestStatus=reqStatus.rejected;


    // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
    removeRequestFromList(MyReceivedLandRequests[LandRequestMapping[_requestId].sellerId ], _requestId);
    removeRequestFromList(MySentLandRequests[LandRequestMapping[_requestId].buyerId], _requestId);

       // Emit the RequestRejected event
    emit RequestRejected(_requestId, msg.sender, LandRequestMapping[_requestId].buyerId);


     // Update the mapping between land ID, buyer address, and request ID
        delete landToBuyerToRequest[LandRequestMapping[_requestId].landId][LandRequestMapping[_requestId].buyerId];


     // Delete the request entry
        delete LandRequestMapping[_requestId];
    }

    // Function to get the request ID for a given land ID
function getRequestForLandId(uint _landId, address _buyer) public view returns (uint) {
    uint requestId = landToBuyerToRequest[_landId][_buyer];

    // Check if the request ID is greater than 0, indicating a valid request
    if (requestId > 0) {
        return requestId;
    }

    // Return 0 if no valid request exists
    return 0;
}


 
//Function to mark payment as done
function markPaymentAsDone(uint _requestId, uint _landId) public  {
    require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
    require(LandRequestMapping[_requestId].requestStatus == reqStatus.accepted, "Invalid request status");
    require(landMapping[_landId].isForSale, "Land is not for sale");

    // Ensure the provided requestId is valid
    require(_requestId > 0, "Invalid requestId");


    // Mark payment as done
    LandRequestMapping[_requestId].isPaymentDone = true;
    LandRequestMapping[_requestId].requestStatus=reqStatus.paymentdone;


    // Emit the PaymentMarkedAsDone event
    emit PaymentMarkedAsDone(_requestId, _landId);
}
//Function to check the status of payment
    function requestStatus(uint requestId) public view returns(bool)
    {
        return LandRequestMapping[requestId].isPaymentDone;
    }

// Function to get the owner's address for a given land ID
function getOwnerAddress(uint _landId) public view returns (address) {
    require(landMapping[_landId].landId > 0, "Land not found");
    return landMapping[_landId].owner;
}

// Function to remove a land from sale
function removeLandFromSale(uint _landId) public {
    // Check if the land is currently listed for sale
    require(landMapping[_landId].isForSale, "Land is not currently listed for sale");

    // Mark the land as not for sale
    landMapping[_landId].isForSale = false;

    // Remove the land ID from the landsforsale list
    for (uint i = 0; i < landsForSale.length; i++) {
        if (landsForSale[i] == _landId) {
            // Swap with the last element and pop
            landsForSale[i] = landsForSale[landsForSale.length - 1];
            landsForSale.pop();
            break;
        }
    }

}


// Function to transfer land ownership
function transferLandOwnership(uint _requestId) public {
       require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
    require(LandRequestMapping[_requestId].requestStatus == reqStatus.paymentdone, "payment not done");
    
    uint landId = LandRequestMapping[_requestId].landId;
    address oldOwner = landMapping[landId].owner;
    address newOwner = LandRequestMapping[_requestId].buyerId;

    // Update the owner of the land
    landMapping[landId].owner = newOwner;

    // Remove the land from landsForSale list
    landMapping[landId].isForSale = false;

       //Add to the accounts list of lands
        MyLands[newOwner].push(landId);

      // Remove the land from landsforsale list if it was listed for sale
    if (landMapping[landId].isForSale) {
        removeLandFromSale(landId);
    }

    
    // Store the previous owner's address in the array
    landMapping[landId].previousOwners.push(oldOwner);

    LandRequestMapping[_requestId].requestStatus= reqStatus.completed;
       // Remove the land from the seller's owned lands
        removeLand(landId);
  


    // Remove the mapping when the land ownership is transferred
       // delete landToBuyerToRequest[landId][newOwner];

    // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
    // removeRequestFromList(MyReceivedLandRequests[LandRequestMapping[_requestId].sellerId ], _requestId);
    // removeRequestFromList(MySentLandRequests[LandRequestMapping[_requestId].buyerId], _requestId);

      // Delete the request entry
    //delete LandRequestMapping[_requestId];


    // Emit the LandOwnershipTransferred event
    emit LandOwnershipTransferred(landId, oldOwner, newOwner);
}


// Function to get the previous owners of a land
function getPreviousOwners(uint _landId) public view returns (address[] memory) {
    require(landMapping[_landId].landId > 0, "Land not found");
    return landMapping[_landId].previousOwners;
}




    //Get all land ids which have been listed for sale
    //except the lands listed for sale by the caller
    function getLandsForSale() public view returns (LandRecord[] memory) {
        uint count = 0;
        for(uint i = 0; i < landsForSale.length; i++) {
            if(landMapping[landsForSale[i]].owner != msg.sender) {
                count++;
            }
        }

        LandRecord[] memory result = new LandRecord[](count);

        uint resultIndex = 0;

        for(uint i = 0; i < landsForSale.length; i++) {
            if(landMapping[landsForSale[i]].owner != msg.sender) {
                result[resultIndex] = landMapping[landsForSale[i]];
                resultIndex++;
            }
        }
        return result;
    }



    function getMyLands() public view returns(LandRecord[] memory) {
        LandRecord[] memory result = new LandRecord[](MyLands[msg.sender].length);

        for(uint i = 0; i < MyLands[msg.sender].length; i++) {
            result[i] = landMapping[MyLands[msg.sender][i]];
        }
        return result;
    }

//Function that returns a list of all lands
    function ReturnAllLandList() public view returns(uint[] memory)
    {
        return allLandList;
    }
}


