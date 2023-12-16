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
        string divison;
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

    event LandRequests(uint requestId, address landOwner, address buyer, uint landId, reqStatus status, bool someFlag);
    event LandRequestCancelled(uint requestId);
    event PaymentMarkedAsDone(uint requestId, uint landId);
    event LandOwnershipTransferred(uint landId, address oldOwner, address newOwner);

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
    function landVerificationRequest(uint _landId) public onlyOwner(_landId) {
        verificationRequired.push(_landId);
    }

    function landRecordExists(LandIdentifier memory _record) 
                                private view returns (bool, uint) {
        uint landId = landMapToId[_record.state][_record.divison]
                                [_record.district][_record.taluka]
                                [_record.village][_record.surveyNumber][_record.subdivision];
        if (landId == 0) {
            return (false, 0);
        }
        return (true, landId);
    }

    //This function is used to add a land record
    function addLandRecord  (LandRecord memory _record) public 
                            onlyRegisteredUser returns (uint) {

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
        landMapToId[_record.identifier.state][_record.identifier.divison]
        [_record.identifier.district][_record.identifier.taluka]
        [_record.identifier.village][_record.identifier.surveyNumber]
        [_record.identifier.subdivision] = landRecordsCount;

        uint addedLandId = landRecordsCount;
        allLandList.push(addedLandId);
        landRecordsCount++;
        emit LandRecordAdded(addedLandId);
        return addedLandId;
    }

    //Get land id
    function getLandId(LandIdentifier memory _identifier) public view returns (uint){
        return landMapToId[_identifier.state][_identifier.divison]
        [_identifier.district][_identifier.taluka][_identifier.village]
        [_identifier.surveyNumber][_identifier.subdivision];
    }

    //Function to approve a land verification request
    function verifyLand(uint _landId) public onlylInspector {
        landMapping[_landId].isVerified = true;
    }

    //List land for sale
    function listLandForSale(uint _landId) public onlyOwner(_landId) 
    onlyVerifiedLand (_landId) {
        //Check if land actually exists
        //Mapping in solidity always exists and maps to a zero value
        //Hence, this check is needed.
        require(landMapping[_landId].landId > 0);

        //Mark the land for Sale
        landMapping[_landId].isForSale = true;

        //Add the land to the landsForSale list
        landsForSale.push(_landId);
    }

 // Function where a buyer can request and show interest in buying a land
    function requestForBuy(uint _landId) public onlyRegisteredUser {
        require(landMapping[_landId].isForSale, "Land is not for sale");

        // Check if the buyer has not already requested for this land
        require(landToBuyerToRequest[_landId][msg.sender] == 0, "Already requested for this land");

        requestCount++;
        LandRequestMapping[requestCount] = LandRequest(requestCount, landMapping[_landId].owner, msg.sender, _landId, reqStatus.requested, false);
        MyReceivedLandRequests[landMapping[_landId].owner].push(requestCount);
        MySentLandRequests[msg.sender].push(requestCount);

        // Update the mapping between land ID, buyer address, and request ID
        landToBuyerToRequest[_landId][msg.sender] = requestCount;

        // Emit the LandRequest event
        emit LandRequests(requestCount, landMapping[_landId].owner, msg.sender, _landId, reqStatus.requested, false);
    }

    // Function to cancel a buyer's request for a land
function cancelBuyerRequest(uint _landId) public onlyRegisteredUser {
    require(landMapping[_landId].isForSale, "Land is not for sale");

    // Check if the buyer has requested for this land
    uint requestId = landToBuyerToRequest[_landId][msg.sender];
    require(requestId > 0, "No request found for this land and buyer");

    // Check if the request is still in the 'requested' status
    require(LandRequestMapping[requestId].requestStatus == reqStatus.requested, "Cannot cancel. Request is not in 'requested' status");

    // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
    removeRequestFromList(MyReceivedLandRequests[landMapping[_landId].owner], requestId);
    removeRequestFromList(MySentLandRequests[msg.sender], requestId);

    // Update the mapping between land ID, buyer address, and request ID
    delete landToBuyerToRequest[_landId][msg.sender];

    // Update the request status to 'rejected' (canceled by the buyer)
    LandRequestMapping[requestId].requestStatus = reqStatus.rejected;
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
function receivedLandRequests(uint _landId) public view returns (uint[] memory) {
    require(landMapping[_landId].owner == msg.sender, "You are not the owner of this land");
    
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

// Function where seller accepts the request of the buyer
    function acceptRequest(uint _requestId) public onlyRegisteredUser {
        require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
        require(LandRequestMapping[_requestId].requestStatus == reqStatus.requested, "Invalid request status");

        // Update the request status
        LandRequestMapping[_requestId].requestStatus = reqStatus.accepted;

        
   
    }

//Function where seller rejects the request of the buyer
    function rejectRequest(uint _requestId) public onlyRegisteredUser
    {
        require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
        require(LandRequestMapping[_requestId].requestStatus == reqStatus.requested, "Invalid request status");

        LandRequestMapping[_requestId].requestStatus=reqStatus.rejected;


    // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
    removeRequestFromList(MyReceivedLandRequests[LandRequestMapping[_requestId].sellerId ], _requestId);
    removeRequestFromList(MySentLandRequests[LandRequestMapping[_requestId].buyerId], _requestId);

     // Delete the request entry
        delete LandRequestMapping[_requestId];
    }

//Function to mark payment as done
function markPaymentAsDone(uint _requestId, uint _landId) public onlyRegisteredUser {
    require(LandRequestMapping[_requestId].sellerId == msg.sender, "Not the seller of this land");
    require(landMapping[_landId].isForSale, "Land is not for sale");

    // Ensure the provided requestId is valid
    require(_requestId > 0, "Invalid requestId");

    // Ensure the request is in the 'accepted' status
    require(LandRequestMapping[_requestId].requestStatus == reqStatus.accepted, "Request not accepted");

    // Mark payment as done
    LandRequestMapping[_requestId].isPaymentDone = true;

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


// Function to transfer land ownership
function transferLandOwnership(uint _requestId) public onlylInspector {
    require(LandRequestMapping[_requestId].requestStatus == reqStatus.accepted, "Request not accepted");
    require(LandRequestMapping[_requestId].isPaymentDone == true, "Payment is not adone");
    
    uint landId = LandRequestMapping[_requestId].landId;
    address oldOwner = landMapping[landId].owner;
    address newOwner = LandRequestMapping[_requestId].buyerId;

    // Update the owner of the land
    landMapping[landId].owner = newOwner;

    // Remove the land from landsForSale list
    landMapping[landId].isForSale = false;

    // Remove the mapping when the land ownership is transferred
        delete landToBuyerToRequest[landId][newOwner];

    // Remove the request from MyReceivedLandRequests and MySentLandRequests lists
    removeRequestFromList(MyReceivedLandRequests[LandRequestMapping[_requestId].sellerId ], _requestId);
    removeRequestFromList(MySentLandRequests[LandRequestMapping[_requestId].buyerId], _requestId);

      // Delete the request entry
    delete LandRequestMapping[_requestId];


    // Emit the LandOwnershipTransferred event
    emit LandOwnershipTransferred(landId, oldOwner, newOwner);
}


    //Get all land ids which have been listed for sale
    function getLandsForSale() public view returns (uint[] memory) {
        return landsForSale;
    }

//Function to view the list of lands of a particular owner
    function myLandsList(address owner) public view returns( uint[] memory){
        return MyLands[owner];
    }


//Function that returns a list of all lands
    function ReturnAllLandList() public view returns(uint[] memory)
    {
        return allLandList;
    }
}


