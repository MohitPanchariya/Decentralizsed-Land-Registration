// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AccountRegistration {
    address public deployer;

    struct UserAccount {
        string username;
        bool isUserVerified;
        uint8 designation; // 0: no authority, 1: land inspector, 2: second-level authority, 3: deployer
        uint registrationDate; // Registration date as a Unix timestamp
        uint256 aadharNumber;
    }

    struct PendingVerification {
        address user;
        uint256 aadharNumber;
    }

    UserAccount[] public userAccounts;
    PendingVerification[] public pendingVerifications;

    // Mapping to store user accounts using their Ethereum addresses as keys
    mapping(address => UserAccount) public userAccountsMap;

    // Mapping to link Aadhar numbers to Ethereum addresses
    mapping(uint256 => address) public aadharToUser;

    mapping(uint256 => UserAccount) public userAccountsByAadharNumber;

    // Constructor to initialize the contract and set the deployer's account
    constructor() {
        deployer = msg.sender;
        userAccounts.push(UserAccount("Deployer", true, 3, block.timestamp, 0));
        userAccountsMap[msg.sender] = userAccounts[0];
        aadharToUser[0] = msg.sender;
    }

    // Function to view the list of pending verifications
    function getPendingVerifications()
        public
        view
        returns (PendingVerification[] memory)
    {
        return pendingVerifications;
    }

    function requestVerification(uint256 _aadharNumber) public {
        bool isVerified;

        // Retrieve user details and isUserVerified in a single call
        (, isVerified, , , ) = getUserDetails(_aadharNumber);

        // Check if the user is not already verified
        require(!isVerified, "User is already verified.");

        // Add the request to pending verifications
        pendingVerifications.push(
            PendingVerification(msg.sender, _aadharNumber)
        );
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

        return
            aadharLength == 12 &&
            _aadharNumber > 101 &&
            _aadharNumber < 1000000000000;
    }

    // Function to verify an account with an Aadhar number
    function verifyAccount(
        uint256 _aadharNumber
    ) public onlyDeployerOrSecondLevelAuthorityOrLandInspector {
        // require(validateAadhar(_aadharNumber), "Invalid Aadhaar number");
        // require(
        //     aadharToUser[_aadharNumber] == address(0),
        //     "Aadhar number already registered."
        // );
        // userAccountsMap[msg.sender].aadharNumber = _aadharNumber;
        userAccountsMap[msg.sender].isUserVerified = true;
        // aadharToUser[_aadharNumber] = msg.sender;

        // Remove from pending verifications if Land Inspector verified the account
        for (uint i = 0; i < pendingVerifications.length; i++) {
            if (pendingVerifications[i].aadharNumber == _aadharNumber) {
                // Remove the pending verification entry
                pendingVerifications[i] = pendingVerifications[
                    pendingVerifications.length - 1
                ];
                pendingVerifications.pop();
                break;
            }
        }
    }

    function setUserDetails(
        string memory _username,
        uint8 _designation,
        uint256 _aadharNumber
    ) public {
        require(_designation >= 0 && _designation <= 2, "Invalid designation.");
        require(validateAadhar(_aadharNumber), "Invalid Aadhar number");
        require(
            aadharToUser[_aadharNumber] == address(0),
            "Aadhar number already registered"
        );

        // Check if user details already exist for this Aadhar number
        require(
            userAccountsByAadharNumber[_aadharNumber].aadharNumber == 0,
            "User details for this Aadhar number already exist."
        );

        // Create a new UserAccount instance
        UserAccount memory newUser = UserAccount({
            username: _username,
            isUserVerified: false,
            designation: _designation,
            registrationDate: block.timestamp,
            aadharNumber: _aadharNumber
        });

        // Store user details in the mapping
        userAccountsByAadharNumber[_aadharNumber] = newUser;

        // Store user details in the userAccounts array (optional)
        userAccounts.push(newUser);

        // Link Aadhar number to the Ethereum address
        aadharToUser[_aadharNumber] = msg.sender;

        // Link Ethereum address to the user details
        userAccountsMap[msg.sender] = newUser;
    }

    function getUserDetails(
        uint256 _aadharNumber
    ) public view returns (string memory, bool, uint8, uint, uint256) {
        // Assuming you have a mapping where you store user details based on Aadhar number
        UserAccount storage user = userAccountsByAadharNumber[_aadharNumber];

        // Perform any additional checks or validations as needed

        return (
            user.username,
            user.isUserVerified,
            user.designation,
            user.registrationDate,
            user.aadharNumber
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
    uint256 _aadhar
) public onlyDeployerOrSecondLevelAuthority {
    require(
        aadharToUser[_aadhar] == address(0),
        "Aadhar number already registered"
    );
    require(validateAadhar(_aadhar), "Invalid Aadhar number");

    // Create a new UserAccount instance for the Land Inspector
    UserAccount memory newInspector = UserAccount({
        username: _username,
        isUserVerified: true,
        designation: 1, // Land Inspector designation
        registrationDate: block.timestamp,
        aadharNumber: _aadhar
    });

    // Store user details in the mapping
    userAccountsByAadharNumber[_aadhar] = newInspector;

    // Store user details in the userAccounts array (optional)
    userAccounts.push(newInspector);

    // Link Aadhar number to the Ethereum address
    aadharToUser[_aadhar] = _inspector;

    // Link Ethereum address to the user details
    userAccountsMap[_inspector] = newInspector;
}


    // Function to add a Second-Level Authority
    function addSecondLevelAuthority(
    address _authority,
    string memory _username,
    uint256 _aadhar
) public onlyDeployer {
    require(
        aadharToUser[_aadhar] == address(0),
        "Aadhar number already registered"
    );
    require(validateAadhar(_aadhar), "Invalid Aadhar number");

    // Create a new UserAccount instance for the Second-Level Authority
    UserAccount memory newAuthority = UserAccount({
        username: _username,
        isUserVerified: true,
        designation: 2, // Second-Level Authority designation
        registrationDate: block.timestamp,
        aadharNumber: _aadhar
    });

    // Store user details in the mapping
    userAccountsByAadharNumber[_aadhar] = newAuthority;

    // Store user details in the userAccounts array (optional)
    userAccounts.push(newAuthority);

    // Link Aadhar number to the Ethereum address
    aadharToUser[_aadhar] = _authority;

    // Link Ethereum address to the user details
    userAccountsMap[_authority] = newAuthority;
}


    // Function to remove a Second-Level Authority
    function removeSecondLevelAuthority(
        address _authority
    ) public onlyDeployer {
        require(
            _authority != deployer,
            "Cannot remove deployer's Second-level Authority privileges"
        );

        aadharToUser[userAccountsMap[_authority].aadharNumber] = address(0);
        delete userAccountsMap[_authority];
    }

    // Function to remove a Land Inspector
    function removeLandInspector(
        address _inspector
    ) public onlyDeployerOrSecondLevelAuthority {
        require(_inspector != deployer, "Cannot remove deployer's privileges");

        aadharToUser[userAccountsMap[_inspector].aadharNumber] = address(0);
        delete userAccountsMap[_inspector];
    }

    // Function to check if a user is verified
    function isUserVerified(address _account) public view returns (bool) {
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
        userAccountsMap[_account].designation = 1;
    }

    // Function to grant Second-Level Authority status
    function grantSecondLevelAuthorityStatus(
        address _account
    ) public onlyDeployer {
        userAccountsMap[_account].designation = 2;
    }
}
