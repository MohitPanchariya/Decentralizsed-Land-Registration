pragma solidity ^0.8.0;
contract LandRegistrationSystem {
    address public deployer;

    struct UserAccount {
        string username;
        bool isVerified;
        uint8 designation; // 0: no authority, 1: land inspector, 2: second-level authority, 3: deployer
        uint registrationDate; // Registration date as a Unix timestamp
        uint256 aadharNumber;
    }

    mapping(address => UserAccount) public userAccounts;
    mapping(uint256 => address) public aadharToUser;

    constructor() {
        deployer = msg.sender;
        userAccounts[msg.sender] = UserAccount("Deployer", true, 3, block.timestamp, 0); 
    }

    modifier onlyDeployer() {
        require(userAccounts[msg.sender].designation == 3, "Only the deployer can perform this action");
        _;
    }

    modifier onlyDeployerOrSecondLevelAuthority() {
        require(userAccounts[msg.sender].designation >= 2, "Only the deployer or second-level authority can perform this action");
        _;
    }

    modifier onlyDeployerOrSecondLevelAuthorityOrLandInspector() {
        require(userAccounts[msg.sender].designation >= 1, "Only the deployer, second level authority, or land inspector can perform this action");
        _;
    }

    function addLandInspector(address _inspector, string memory _username, uint256 _aadhar) public onlyDeployerOrSecondLevelAuthority {
        require(aadharToUser[_aadhar] == address(0), "Aadhar number already registered.");
        userAccounts[_inspector] = UserAccount(_username, false, 1, block.timestamp, _aadhar);
        aadharToUser[_aadhar] = _inspector;
    }

    function addSecondLevelAuthority(address _authority, string memory _username, uint256 _aadhar) public onlyDeployer {
        require(aadharToUser[_aadhar] == address(0), "Aadhar number already registered.");
        userAccounts[_authority] = UserAccount(_username, false, 2, block.timestamp, _aadhar);
        aadharToUser[_aadhar] = _authority;
    }

    function removeSecondLevelAuthority(address _authority) public onlyDeployer {
        require(_authority != deployer, "Cannot remove deployer's Second-level Authority privileges.");
        aadharToUser[userAccounts[_authority].aadharNumber] = address(0);
        delete userAccounts[_authority];
    }

    function removeLandInspector(address _inspector) public onlyDeployerOrSecondLevelAuthority {
        require(_inspector != deployer, "Cannot remove deployer's privileges.");
        aadharToUser[userAccounts[_inspector].aadharNumber] = address(0);
        delete userAccounts[_inspector];
    }
    
    /* For Aadhaar validation
        It should have 12 digits.
        It should not start with 0 and 1.
        It should not contain any alphabet and special char */
        
    function validateAadhar(uint256 _aadharNumber) public pure returns (bool) {
        uint aadharLength = 0;
        uint aadharCopy = _aadharNumber;
        
        while (aadharCopy != 0) {
            aadharCopy /= 10;
            aadharLength++;
        }
        
        return aadharLength == 12 && _aadharNumber > 101 && _aadharNumber < 1000000000000;
    }

    function verifyAccount(uint256 _aadharNumber) public onlyDeployerOrSecondLevelAuthorityOrLandInspector {
        require(validateAadhar(_aadharNumber), "Invalid Aadhaar number");
        
        require(aadharToUser[_aadharNumber] == address(0), "Aadhar number already registered.");
        
        userAccounts[msg.sender].aadharNumber = _aadharNumber;
        userAccounts[msg.sender].isVerified = true;
        aadharToUser[_aadharNumber] = msg.sender;
    }

    function isVerified(address _account) public view returns (bool) {
        return userAccounts[_account].isVerified;
    }

    function grantLandInspectorStatus(address _account) public onlyDeployerOrSecondLevelAuthority {
        userAccounts[_account].designation = 1;
    }

    function grantSecondLevelAuthorityStatus(address _account) public onlyDeployer {
        userAccounts[_account].designation = 2;
    }
}
