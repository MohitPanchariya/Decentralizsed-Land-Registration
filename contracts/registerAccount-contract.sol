// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AccountRegistration {
    address public deployer;

    struct UserAccount {
        address userAddress;
        string username;
        bool isUserVerified;
        uint8 designation; // 0: no authority, 1: land inspector, 2: second-level authority, 3: deployer
        uint registrationDate; // Registration date as a Unix timestamp
        uint256 aadharNumber;
    }

    struct PendingVerification {
        address userAddress;
        uint256 aadharNumber;
    }

    UserAccount[] public userAccounts;
    PendingVerification[] public pendingVerifications;
    
    // Mapping to store user accounts using their Ethereum addresses as keys
    mapping(address => UserAccount) public userAccountsMap;

    // Mapping to link Aadhar numbers to Ethereum addresses
    mapping(uint256 => address) public aadharToUser;

    // Constructor to initialize the contract and set the deployer's account
    constructor() {
        deployer = msg.sender;
        addUser(deployer, "Deployer", 3, true, 123456789012);
    }
    // Function to view the list of pending verifications
    function getPendingVerifications() public view returns (PendingVerification[] memory) {
        return pendingVerifications;
    }

    function requestVerification(uint256 _aadharNumber) public {        
        // Add the request to pending verifications
        pendingVerifications.push(PendingVerification(msg.sender, _aadharNumber));
    }

    /* For Aadhaar validation
    It should have 12 digits.
    It should not start with 0 and 1.
    It should not contain any alphabet and special characters */
    function validateAadhar(uint256 _aadharNumber) public pure returns (bool) {
        uint aadharLength = 0;
        uint aadharCopy = _aadharNumber;
        
        while (aadharCopy != 0) {
            aadharCopy /= 10;
            aadharLength++;
        }
        
        return aadharLength == 12 && _aadharNumber > 101 && _aadharNumber < 1000000000000;
    }

    // Function to verify an account with an Aadhar number
    function verifyAccount(uint256 _aadharNumber) public onlyDeployerOrSecondLevelAuthorityOrLandInspector {
        // Find the Ethereum address associated with the given Aadhar number
        address userToVerify = aadharToUser[_aadharNumber];

        // Ensure that the user exists
        require(userToVerify != address(0), "No user found for the provided Aadhar number");

        // Set the isUserVerified flag to true for the user
        userAccountsMap[userToVerify].isUserVerified = true;

        // Remove from pending verifications if account is verified
        for (uint i = 0; i < pendingVerifications.length; i++) {
            if (pendingVerifications[i].aadharNumber == _aadharNumber) {
                // Remove the pending verification entry
                pendingVerifications[i] = pendingVerifications[pendingVerifications.length - 1];
                pendingVerifications.pop();
                break;
            }
        }
    }

    // Function to add a user
    function addUser(address _user, string memory _username, uint8 _designation, bool isUserVerified, uint256 _aadharNumber) internal {
        require(userAccountsMap[_user].userAddress == address(0), "Address already registered");
        require(validateAadhar(_aadharNumber), "Invalid Aadhar number");
        require(aadharToUser[_aadharNumber] == address(0), "Aadhar number already registered");

        userAccounts.push(UserAccount(_user, _username, isUserVerified , _designation, block.timestamp, _aadharNumber));
        userAccountsMap[_user] = userAccounts[userAccounts.length - 1];
        aadharToUser[_aadharNumber] = _user;
    }

    // Function to set user details
    function setUserDetails(string memory _username, uint256 _aadharNumber) public {
        addUser(msg.sender, _username, 0, false, _aadharNumber);
    }

    // Function to Check User Details
    function getUserDetails(uint256 _aadharNumber) public view returns (address userAddress, string memory username, bool isUserVerified, uint8 designation, uint registrationDate, uint256 aadharNumber) {
        // Find the Ethereum address associated with the given Aadhar number
        address userToRetrieve = aadharToUser[_aadharNumber];

        // Ensure that the user exists
        require(userToRetrieve != address(0), "No user found for the provided Aadhar number");

        // Retrieve user details using the Ethereum address
        UserAccount storage user = userAccountsMap[userToRetrieve];
        
        return (user.userAddress, user.username, user.isUserVerified, user.designation, user.registrationDate, user.aadharNumber);
    }

    // Modifier to restrict access to functions for the deployer only
    modifier onlyDeployer() {
        require(userAccountsMap[msg.sender].designation == 3, "Only the deployer can perform this action");
        _;
    }

    // Modifier to restrict access to functions for the deployer and second-level authorities
    modifier onlyDeployerOrSecondLevelAuthority() {
        require(userAccountsMap[msg.sender].designation >= 2, "Only the deployer or second-level authority can perform this action");
        _;
    }

    // Modifier to restrict access to functions for the deployer, second-level authorities, and land inspectors
    modifier onlyDeployerOrSecondLevelAuthorityOrLandInspector() {
        require(userAccountsMap[msg.sender].designation >= 1, "Only the deployer, second-level authority, or land inspector can perform this action");
        _;
    }

   // Function to add a Land Inspector
    function addLandInspector(address _inspector, string memory _username, uint256 _aadhar) public onlyDeployerOrSecondLevelAuthority {
        addUser(_inspector, _username, 1, true, _aadhar);
    }

    // Function to add a Second-Level Authority
    function addSecondLevelAuthority(address _authority, string memory _username, uint256 _aadhar) public onlyDeployer {
        addUser(_authority, _username, 2, true, _aadhar);
    }

    // Function to remove a Second-Level Authority
    function removeSecondLevelAuthority(address _authority) public onlyDeployer {
        require(_authority != deployer, "Cannot remove deployer's Second-level Authority privileges");

        // Ensure that the provided address is associated with a user
        require(userAccountsMap[_authority].userAddress != address(0), "User not found for the provided address");

        // Remove the user and update the mapping
        aadharToUser[userAccountsMap[_authority].aadharNumber] = address(0);
        delete userAccountsMap[_authority];
    }

    // Function to remove a Land Inspector
    function removeLandInspector(address _inspector) public onlyDeployerOrSecondLevelAuthority {
        require(_inspector != deployer, "Cannot remove deployer's Land Inspector privileges");

        // Ensure that the provided address is associated with a user
        require(userAccountsMap[_inspector].userAddress != address(0), "User not found for the provided address");
        
        aadharToUser[userAccountsMap[_inspector].aadharNumber] = address(0);
        delete userAccountsMap[_inspector];
    }

    // Function to check if a user is verified
    function checkUserVerified(address _account) public view returns (bool) {
        return userAccountsMap[_account].isUserVerified;
    }

    // Function to check if a user is a Land Inspector
    function isLandInspector(address _account) public view returns (bool) {
        return userAccountsMap[_account].designation == 1;
    }

    // Function to check if a user is a Second-Level Authority
    function isSecondLevelAuthority(address _account) public view returns (bool) {
        return userAccountsMap[_account].designation == 2;
    }

    // Function to check if a user is a Sdeployer
    function isDeployer(address _account) public view returns (bool) {
        return userAccountsMap[_account].designation == 3;
    }

    // Function to grant Land Inspector status
    function grantLandInspectorStatus(address _account) public onlyDeployerOrSecondLevelAuthority {
        userAccountsMap[_account].isUserVerified = true;
        userAccountsMap[_account].designation = 1;
    }

    // Function to grant Second-Level Authority status
    function grantSecondLevelAuthorityStatus(address _account) public onlyDeployer {
        userAccountsMap[_account].isUserVerified = true;
        userAccountsMap[_account].designation = 2;
    }
    // Function to revoke Land Inspector status
    function revokeLandInspectorStatus(address _account) public onlyDeployerOrSecondLevelAuthority {
        require(isLandInspector(_account), "The account is not a Land Inspector");
        userAccountsMap[_account].isUserVerified = false;
        userAccountsMap[_account].designation = 0;
    }

    // Function to revoke Second-Level Authority status
    function revokeSecondLevelAuthorityStatus(address _account) public onlyDeployer {
        require(isSecondLevelAuthority(_account), "The account is not a Second-Level Authority");
        userAccountsMap[_account].isUserVerified = false;
        userAccountsMap[_account].designation = 0;
    }
}