// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract LandRegistration {

    //Address which deployed this smart contract
    address deployer;

    constructor() {
        deployer = msg.sender;
    }

    struct LandRecord {
        uint landId;
        //Address of the account(person) that owns this piece of land
        /* 
            Note: There can be multiple owners of a single piece of land.
            This is being ignored for now.
        */
        address owner;

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

    uint public landRecordsCount = 1;

    modifier onlyOwner(uint _landId) {
        require(
            msg.sender == landMapping[_landId].owner,
            "Only owner can perform this operation."
        );
        _;
    }

    modifier onylInspector() {
        //This will be a function call to the other contract once thats
        //available
        bool isInspector = true;
        require(isInspector, "Only inspector can perform this action.");
        _;
    }

    modifier onlyRegisteredUser() {
        //This will be a function call to the other contract once thats
        //available
        bool isRegisteredUser = true;
        require(isRegisteredUser, "Only registered user can perform this action.");
        _;
    }

    /*
        Mapping of land records by hierarchy. Mapping is as follows:
        state => {
            division => {
                district => {
                    taluka => {
                        village => id
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
                        string => uint
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

    function landRecordExists(
        string calldata _state , string calldata _division, 
        string calldata _district, string calldata _taluka,
        string calldata _village
    ) private view returns (bool, uint) {
        uint landId = landMapToId[_state][_division][_district][_taluka][_village];
        if (landId == 0) {
            return (false, 0);
        }
        return (true, landId);
    }

    //This function is used to add a land record
    function addLandRecord  (
        string calldata _state , string calldata _division, 
        string calldata _district, string calldata _taluka,
        string calldata _village, uint _surveyNumber, 
        string calldata _subDivison, uint _area, uint _purchaseDate,
        uint _purchasePrice, uint _landValueAtPurchase, 
        address[] calldata _previousOwners
    ) public onlyRegisteredUser returns (uint) {
        (bool recordExists, uint landId) = landRecordExists(
            _state, _division, _district, _taluka, _village
        );

        //If land record already exists, return the land id
        if (recordExists) {
            return landId;
        }

        //If the land record doesn't already exist, add it to the mapping
        //and return land id
        landMapping[landRecordsCount] = LandRecord(
            landId, msg.sender, _state, _division, _district, _taluka, _village,
            _surveyNumber, _subDivison, _area, _purchaseDate, _purchasePrice,
            _landValueAtPurchase, _previousOwners, false, false
        );

        uint addedLandId = landRecordsCount;
        landRecordsCount++;
        return addedLandId;
    }

    //Get land id
    function getLandId(
        string calldata _state , string calldata _division, 
        string calldata _district, string calldata _taluka,
        string calldata _village
    ) public view returns (uint){
        return landMapToId[_state][_division][_district][_taluka][_village];
    }

    //Function to approve a land verification request
    function verifyLand(uint _landId) public onylInspector {
        landMapping[_landId].isVerified = true;
    }

    //List land for sale
    function listLandForSale(uint _landId) public onlyOwner(_landId) {
        //Check if land actually exists
        //Mapping in solidity always exists and maps to a zero value
        //Hence, this check is needed.
        require(landMapping[_landId].landId > 0);

        //Mark the land for Sale
        landMapping[_landId].isForSale = true;

        //Add the land to the landsForSale list
        landsForSale.push(_landId);
    }

    //Get all land ids which have been listed for sale
    function getLandsForSale() public view returns (uint[] memory) {
        return landsForSale;
    }
}