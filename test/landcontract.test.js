const AccountRegistration = artifacts.require("AccountRegistration");
const LandRegistration = artifacts.require("LandRegistration");
const truffleAssert = require("truffle-assertions");

contract("LandRegistration", async (accounts) => {
    let AccountRegistrationInstance, landRegistrationInstance;
    let owner, inspector, verifiedUser, secondLevelAuthority;
    let unverified;
    let accountDeployer;

    before(async () => {
        //Deploy account registration contract
        AccountRegistrationInstance = await AccountRegistration.deployed();

        //Deploy land registration contract
        landRegistrationInstance = await LandRegistration.new(
            AccountRegistrationInstance.address
        );

        accountDeployer = await AccountRegistrationInstance.deployer();

        //Assign addresses to these roles
        [owner, inspector, verifiedUser, 
        unRegisteredUser, secondLevelAuthority, unverified] = accounts;

        //Add a second level authority
        await AccountRegistrationInstance.addSecondLevelAuthority(
            secondLevelAuthority, "testSecondLevelAuthority", 
            101101101101,
            {from: accountDeployer}
        );

        //Add a land inspector
        await AccountRegistrationInstance.addLandInspector(
            inspector, "testLandInspector", 101101101102,
            {from: accountDeployer}
        )

        //Verify a user(owner)
        await AccountRegistrationInstance.verifyAccount(
            101101101100,
            {from: accountDeployer}
        )
    })

    it(
        "Ensure that the land registration contract has the correct account " + 
        "registration contract address",
        async () => {
            const accountRegistrationAddress = (
                await landRegistrationInstance.accountRegistrationContract()
            );
            
            assert.equal(
                accountRegistrationAddress, AccountRegistration.address,
                "The account contracts address in the land registration " + 
                "contract must be the address of the actual account " +
                "registration contract" 
            );

        }
    )

    describe("Add Land Records", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Ensure that a land record can be added.", async () => {
            
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordAdded");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordAdded", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                1, landId, "This is the first land added. Its id must be 1."
            )
        })
    
        it("Ensure that a land record can't be added twice", async () => {
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordExists");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordExists", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                1, landId, "Since this record has already been added, its id is" + 
                " still 1"
            )
        })
    
        it("Ensure that a differen't land record can be added", async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            let landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "a different sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
    
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordAdded");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordAdded", {
                filter: { landId: 2 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()
            assert.equal(
                2, landId, "This is the second land added. Its id must be 2."
            )
    
        })

        it("Ensure that a unverified user can't add a land record", async () => {
            try {
                const addLandTx = await landRegistrationInstance.addLandRecord(
                    landRecord, {from: unverified}
                );
            } catch (error) {
                assert(
                    error.message.includes("Only registered user can perform this action."),
                    "Error not thrown"
                );
            }
        })
    })

    describe("Land Verification", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Owner can request for land verification", async () => {
            const addLandTx = await landRegistrationInstance.addLandRecord(
                landRecord, {from: owner}
            );
    
            truffleAssert.eventEmitted(addLandTx, "LandRecordExists");
    
            // Get the event object.
            const event = await landRegistrationInstance.getPastEvents("LandRecordExists", {
                filter: { landId: 1 },
                fromBlock: addLandTx.blockNumber,
                toBlock: addLandTx.blockNumber
            });
    
            const landId  = event[0].args.landId.toNumber()

            const verificationTx = await landRegistrationInstance.landVerificationRequest(
                landId, {from: owner}
            )
        })

        it("Only owner can request for verification", async () => {
            landRecord.owner = unverified;

            try {
                await landRegistrationInstance.landVerificationRequest(
                    1, {from: unverified}
                )
            } catch(error) {
                assert(
                    error.message.includes("Only owner can perform this operation.")
                )
            }
        })
    })

    describe("Land ID", () => {
        let landRecord;

        before(async () => {
            const area = 100, purchaseDate = 1698568923, landValueAtPurchase = 100;
            const purchasePrice = 100, surveryNumber = 123;
            
            landRecord = {
                landId: 0,
                owner: owner,
                identifier: {
                    state: "sample state",
                    divison: "sample division",
                    district: "sample district",
                    taluka: "sample taluka",
                    village: "sample village",
                    surveyNumber: surveryNumber,
                    subdivision: "1/A"
                },
                area: area,
                purchaseDate: purchaseDate,
                purchasePrice: purchasePrice,
                landValueAtPurchase: landValueAtPurchase,
                previousOwners: [],
                isVerified: false,
                isForSale: false
            }
        })

        it("Correct Land ID is returned", async () => {
            //Since getLandId is a static call and not a transaction,
            //the return value is directly accessible
            const landId = await landRegistrationInstance.getLandId(
                landRecord.identifier, {from: owner}
            )
            
            assert.equal(
                1, landId, "The first land added has a land id of 1."
            )
        })

        it("Returns zero when Land Record doesn't exist", async () => {
            landRecord.identifier.state = "A non existent state"

            const landId = await landRegistrationInstance.getLandId(
                landRecord.identifier, {from: owner}
            )
            
            assert.equal(
                0, landId, "Since the land doesn't exist zero must be returnred."
            )


        })
    })

    describe("Land Sale", () => {
        const landId  = 1;
        
        it("Ensures that a verified land can be put up for sale", async () => {

            //Request land verification
            await landRegistrationInstance.landVerificationRequest(landId, {from: owner});
            
            //Approve land verification request
            await landRegistrationInstance.verifyLand(landId, {from: inspector});
            //list the land for sale
            await landRegistrationInstance.listLandForSale(landId, {from: owner});
            
            //Get the lands for sale
            const landsForSale = await landRegistrationInstance.getLandsForSale();    

            //BN is a different type from BigNumber
            //Tried casting a number to a BN and using includes but it always
            //returns false despite the number being present.
            //The casted number is missing a few properties. This could be the 
            //reason for an always false return value.
            //Using a loop is a simple solution here
            const landIfFound = landsForSale.some(
                (element) => {
                    if (element.toNumber() === landId) {
                        return true
                    }
                }
            )

            assert.equal(
                true, landIfFound, "Land id 1 must be present in the list of" +
                " lands for sale."
            );

        })

        it("Ensures that only an owner can put up the land for sale", async () => {
            try {
                await landRegistrationInstance.listLandForSale(landId, {
                    from: unverified
                })
            } catch(error) {
                assert(
                    error.message.includes("Only owner can perform this operation.")
                )
            }
        })

        it("Ensures that only a verified land can be put up for sale", async () => {
            try {
                await landRegistrationInstance.listLandForSale(landId, {
                    from: owner
                })
            } catch (error) {
                assert(
                    error.message.include("Only verified lands can be put up for sale.")
                )
            }
        })
    })
})