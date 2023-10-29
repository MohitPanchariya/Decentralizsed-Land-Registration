// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./registerAccount-contract.sol";

interface IAccountRegistration {
    function isUserVerified(address _account) external returns (bool);
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
    mapping(uint => uint[])  allLandList;

    
   //Requests counts made from buyers and declaration of  documentId  variable
    uint public documentId;
    uint requestCount;


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
        ).isUserVerified(msg.sender);

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
        allLandList[1].push(landRecordsCount);
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

//Function where a buyer can request and show interest in buying  a land
 function requestforBuy(uint _landId) public onlyRegisteredUser
    {
        // require(isUserVerified(msg.sender) && verifyLand(_landId));

        requestCount++;
        LandRequestMapping[requestCount]=LandRequest(requestCount,landMapping[_landId].owner,msg.sender,_landId,reqStatus.requested,false);
        MyReceivedLandRequests[landMapping[_landId].owner].push(requestCount);
        MySentLandRequests[msg.sender].push(requestCount);
    }

//Function that will return a list of received land requests buyers interested for a particular land
    function receivedLandRequests() public view returns(uint[] memory)
    {
        return MyReceivedLandRequests[msg.sender];
    }

//Function that will return a list of buyers interested for a particular land and have sent requests
    function sentLandRequests() public view returns(uint[] memory)
    {
        return MySentLandRequests[msg.sender];
    }

//Function where seller accepts the request of the buyer
    function acceptRequest(uint _requestId) public
    {
        require(LandRequestMapping[_requestId].sellerId==msg.sender);
        LandRequestMapping[_requestId].requestStatus=reqStatus.accepted;
    }

//Function where seller rejects the request of the buyer
    function rejectRequest(uint _requestId) public
    {
        require(LandRequestMapping[_requestId].sellerId==msg.sender);
        LandRequestMapping[_requestId].requestStatus=reqStatus.rejected;
    }

//Function to check the status of payment
    function requestStatus(uint id) public view returns(bool)
    {
        return LandRequestMapping[id].isPaymentDone;
    }

//Function that requires LandInspector approval before transfer of ownership
    function LandInspectorApproval(uint id) public view returns(bool)
    {
        return true;
    }

//Function for transferring ownership of land between two parties
 function transferLandOwnership(uint _requestId,LandIdentifier memory documentUrl) onlylInspector public returns(bool)
    {
        // require(isLandInspector(msg.sender) && LandInspectorApproval(msg.sender));

        if(LandRequestMapping[_requestId].isPaymentDone==false)
            return false;
        documentId++;
        LandRequestMapping[_requestId].requestStatus=reqStatus.completed;
        MyLands[LandRequestMapping[_requestId].buyerId].push(LandRequestMapping[_requestId].landId);

        uint len=MyLands[LandRequestMapping[_requestId].sellerId].length;
        for(uint i=0;i<len;i++)
        {
            if(MyLands[LandRequestMapping[_requestId].sellerId][i]==LandRequestMapping[_requestId].landId)
            {
                MyLands[LandRequestMapping[_requestId].sellerId][i]=MyLands[LandRequestMapping[_requestId].sellerId][len-1];
                
                MyLands[LandRequestMapping[_requestId].sellerId].pop();
                break;
            }
        }
        landMapping[LandRequestMapping[_requestId].landId].identifier=documentUrl;
        landMapping[LandRequestMapping[_requestId].landId].isForSale=false;
        landMapping[LandRequestMapping[_requestId].landId].owner=LandRequestMapping[_requestId].buyerId;
        return true;
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
        return allLandList[1];
    }
}
