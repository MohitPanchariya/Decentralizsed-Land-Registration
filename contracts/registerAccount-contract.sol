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
        uint256 phoneNumber;
    }

    struct PendingVerification {
        address userAddress;
        uint256 phoneNumber;
    }

    UserAccount[] public userAccounts;
    PendingVerification[] public pendingVerifications;

    // Mapping to store user accounts using their Ethereum addresses as keys
    mapping(address => UserAccount) public userAccountsMap;

    // Mapping to link phone numbers to Ethereum addresses
    mapping(uint256 => address) public phoneToUser;

    // Constructor to initialize the contract and set the deployer's account
    constructor() {
        deployer = msg.sender;
        addUser(deployer, "Deployer", 3, true, 8890890987);
    }

    // Function to view the list of pending verifications
    function getPendingVerifications()
        public
        view
        returns (PendingVerification[] memory)
    {
        return pendingVerifications;
    }

    function requestVerification(uint256 _phoneNumber) public {
        // Add the request to pending verifications
        pendingVerifications.push(
            PendingVerification(msg.sender, _phoneNumber)
        );
    }

    function validatePhone(uint256 _phoneNumber) public pure returns (bool) {
        uint phoneLength = 0;
        uint phoneCopy = _phoneNumber;

        // Count the number of digits in the phone number
        while (phoneCopy != 0) {
            phoneCopy /= 10;
            phoneLength++;
        }

        // Check if the phone number is 10 digits and starts with 7, 8, or 9
        uint firstDigit = (_phoneNumber / 10 ** (phoneLength - 1)) % 10;

        return
            phoneLength == 10 &&
            (firstDigit == 7 || firstDigit == 8 || firstDigit == 9);
    }

    // Function to verify an account with an phone number
    function verifyAccount(
        uint256 _phoneNumber
    ) public onlyDeployerOrSecondLevelAuthorityOrLandInspector {
        // Find the Ethereum address associated with the given phone number
        address userToVerify = phoneToUser[_phoneNumber];

        // Ensure that the user exists
        require(
            userToVerify != address(0),
            "No user found for the provided phone number"
        );

        // Check if the user is already verified
        require(
            userAccountsMap[userToVerify].isUserVerified != true,
            "User account is already verified"
        );

        // Set the isUserVerified flag to true for the user
        userAccountsMap[userToVerify].isUserVerified = true;

        // Remove from pending verifications if account is verified
        for (uint i = 0; i < pendingVerifications.length; i++) {
            if (pendingVerifications[i].phoneNumber == _phoneNumber) {
                // Remove the pending verification entry
                pendingVerifications[i] = pendingVerifications[
                    pendingVerifications.length - 1
                ];
                pendingVerifications.pop();
                break;
            }
        }
    }

    // Function to add a user
    function addUser(
        address _user,
        string memory _username,
        uint8 _designation,
        bool isUserVerified,
        uint256 _phoneNumber
    ) internal {
        require(
            userAccountsMap[_user].userAddress == address(0),
            "Address already registered"
        );
        require(validatePhone(_phoneNumber), "Invalid phone number");
        require(
            phoneToUser[_phoneNumber] == address(0),
            "phone number already registered"
        );

        userAccounts.push(
            UserAccount(
                _user,
                _username,
                isUserVerified,
                _designation,
                block.timestamp,
                _phoneNumber
            )
        );
        userAccountsMap[_user] = userAccounts[userAccounts.length - 1];
        phoneToUser[_phoneNumber] = _user;
    }

    // Function to set user details
    function setUserDetails(
        string memory _username,
        uint256 _phoneNumber
    ) public {
        addUser(msg.sender, _username, 0, false, _phoneNumber);
    }

    // Function to Check User Details
    function getUserDetailsByAddress(
        address _userAddress
    )
        public
        view
        returns (
            string memory username,
            bool isUserVerified,
            uint8 designation,
            uint registrationDate,
            uint256 phoneNumber,
            address userAddress
        )
    {
        // Ensure that the user exists
        require(_userAddress != address(0), "Invalid user address");

        // Retrieve user details using the Ethereum address
        UserAccount storage user = userAccountsMap[_userAddress];

        return (
            user.username,
            user.isUserVerified,
            user.designation,
            user.registrationDate,
            user.phoneNumber,
            user.userAddress
        );
    }

    // Modifier to restrict access to functions for the deployer only
    modifier onlyDeployer() {
        require(
            userAccountsMap[msg.sender].designation == 3,
            "Only the deployer can perform this action"
        );
        _;
    }

    // Modifier to restrict access to functions for the deployer and second-level authorities
    modifier onlyDeployerOrSecondLevelAuthority() {
        require(
            userAccountsMap[msg.sender].designation >= 2,
            "Only the deployer or second-level authority can perform this action"
        );
        _;
    }

    // Modifier to restrict access to functions for the deployer, second-level authorities, and land inspectors
    modifier onlyDeployerOrSecondLevelAuthorityOrLandInspector() {
        require(
            userAccountsMap[msg.sender].designation >= 1,
            "Only the deployer, second-level authority, or land inspector can perform this action"
        );
        _;
    }

    // Function to add a Land Inspector
    function addLandInspector(
        address _inspector,
        string memory _username,
        uint256 _phone
    ) public onlyDeployerOrSecondLevelAuthority {
        addUser(_inspector, _username, 1, true, _phone);
    }

    // Function to add a Second-Level Authority
    function addSecondLevelAuthority(
        address _authority,
        string memory _username,
        uint256 _phone
    ) public onlyDeployer {
        addUser(_authority, _username, 2, true, _phone);
    }

    // Function to remove a Second-Level Authority
    function removeSecondLevelAuthority(
        address _authority
    ) public onlyDeployer {
        require(
            _authority != deployer,
            "Cannot remove deployer's Second-level Authority privileges"
        );

        // Ensure that the provided address is associated with a user
        require(
            userAccountsMap[_authority].userAddress != address(0),
            "User not found for the provided address"
        );

        // Remove the user and update the mapping
        phoneToUser[userAccountsMap[_authority].phoneNumber] = address(0);
        delete userAccountsMap[_authority];
    }

    // Function to remove a Land Inspector
    function removeLandInspector(
        address _inspector
    ) public onlyDeployerOrSecondLevelAuthority {
        require(
            _inspector != deployer,
            "Cannot remove deployer's Land Inspector privileges"
        );

        // Ensure that the provided address is associated with a user
        require(
            userAccountsMap[_inspector].userAddress != address(0),
            "User not found for the provided address"
        );

        phoneToUser[userAccountsMap[_inspector].phoneNumber] = address(0);
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
    function isSecondLevelAuthority(
        address _account
    ) public view returns (bool) {
        return userAccountsMap[_account].designation == 2;
    }

    // Function to check if a user is a Sdeployer
    function isDeployer(address _account) public view returns (bool) {
        return userAccountsMap[_account].designation == 3;
    }

    // Function to grant Land Inspector status
    function grantLandInspectorStatus(
        address _account
    ) public onlyDeployerOrSecondLevelAuthority {
        userAccountsMap[_account].isUserVerified = true;
        userAccountsMap[_account].designation = 1;
    }

    // Function to grant Second-Level Authority status
    function grantSecondLevelAuthorityStatus(
        address _account
    ) public onlyDeployer {
        userAccountsMap[_account].isUserVerified = true;
        userAccountsMap[_account].designation = 2;
    }

    // Function to revoke Land Inspector status
    function revokeLandInspectorStatus(
        address _account
    ) public onlyDeployerOrSecondLevelAuthority {
        require(
            isLandInspector(_account),
            "The account is not a Land Inspector"
        );
        userAccountsMap[_account].isUserVerified = false;
        userAccountsMap[_account].designation = 0;
    }

    // Function to revoke Second-Level Authority status
    function revokeSecondLevelAuthorityStatus(
        address _account
    ) public onlyDeployer {
        require(
            isSecondLevelAuthority(_account),
            "The account is not a Second-Level Authority"
        );
        userAccountsMap[_account].isUserVerified = false;
        userAccountsMap[_account].designation = 0;
    }
}
