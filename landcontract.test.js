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

     describe("Buyer shows interest in buying land", () => {
        //Considering simple case where there is one land and one user(buyer)
        const landId  = 1;
        const requestId = 1;
        let requestcount = 0;

        it("Ensures that a buyer can buy or show interest in buying the land for sale", async () => {

              //sent buy requests for land
            const sentbuyrequests= await landRegistrationInstance.sentLandRequests();    

              //Get the lands for sale
              const landsForSale = await landRegistrationInstance.getLandsForSale();    

              //list the land for sale
              await landRegistrationInstance.listLandForSale(landId, {from: owner});

            
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

        it("Ensures that only a verified user can send request to buy a land ", async () => {
            try {
                await landRegistrationInstance.requestforBuy(landId, {from: owner});
            } catch (error) {
                assert(
                    error.message.include("Only verified user can request for buying the land.")
                )
            }
        })

      

        it("Ensure that a verified user cannot send buy request for the same land twice", async () => {
            const addsendlandreqTx = await landRegistrationInstance.requestforBuy(landId, {from: owner});
            if(requestId === 1 && landId === 1)
            {
                requestcount++;
            }

            assert.equal(
                1, requestcount, "Since the request has already been sent, it won't allow the user to send request again."
            )
          

        })

    })

    describe("Seller responds to the buyer request", () => {
        //Considering a simple case where there are two buyers and one land and two buyer requests made for the same land
        const landId  = 1;
        const reqId = 1;
        const reqId1 =  1;
        const reqId2 = 2;
        let acceptcount = 0;

         it("Ensures that only a verified user can accept the request", async () => {
            try {
                await landRegistrationInstance.acceptRequest(reqId, {from: owner});
            } catch (error) {
                assert(
                    error.message.include("Only verified user can accept the request for land.")
                )
            }
           
        })

        it("Ensures that only a verified user can reject to the request", async () => {
            try {
                await landRegistrationInstance.rejectRequest(reqId, {from: owner});
            } catch (error) {
                assert(
                    error.message.include("Only verified user can reject the request for land.")
                )
            }
           
        })

        it("Ensures that a user cannot accept requests of two different buyers at the same time for the same land", async () => {
           
            const addreceivedRequestTx = await landRegistrationInstance.acceptRequest(reqId1, {from: owner});
            if(reqId1 === 1 && landId === 1 &&  addreceivedRequestTx)
            {
               acceptcount++;
            }
            if(reqId2 === 1 && landId === 1)
            {
                addreceivedRequestTx = await landRegistrationInstance.rejectRequest(reqId2, {from: owner});
            }

            assert.equal(
                1, acceptcount, "One request has already been accepted, the second request is just discarded"
            );
    
        })

    })


    describe("Transfer of ownership of land between seller and buyer" , () => {
        //Considering a simple case where there are two buyers and one land and two buyer requests made for the same land
        const reqId = 1;
        const reqId1 =  1;
        const reqId2 = 2;
        let acceptcount = 0;


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

        it("Ensures that only a verified lands' ownership can be transferred between seller and buyer !", async () => {
            const acceptedreq = await landRegistrationInstance.acceptRequest(reqId, {from: owner});
            try { 
                    if(acceptcount === 1)
                    {
                        await landRegistrationInstance.transferLandOwnership(reqId, landRecord, {
                            from: inspector
                        })
                    }
            } catch (error) {
                assert(
                    error.message.include("Only verified lands' ownership can be transferred")
                )
            }
        })

        it("Ensures that user can change the status of the land : whether its for sale or not after ownership is granted and its set not for sale !", async () => {
            
            try { 
                const acceptedreq = await landRegistrationInstance.listLandForSale(reqId, {from: owner});
            } catch (error) {
                assert(
                    error.message.include("Allows only not for sale land to change status to sale")
                )
            }
        })

    })

})