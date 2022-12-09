// Useful Stuff
// npx hardhat run --network hardhat scripts/test.js
// https://github.com/NazaWEb/ultimate-smart-contracts/blob/main/Web3BuildersERC721.sol from another good tutorial
// https://docs.openzeppelin.com/contracts/4.x/wizard  generate base token contracts
// https://www.youtube.com/watch?v=LHZC9wX3r0I  Royalties
// https://github.com/rarible/protocol-contracts/tree/master/royalties/contracts base contracts from rarible

const hre = require("hardhat");
const ethers = hre.ethers

const provenance = require('../../assets/metadata/provenance.json')
const { dateutils, decimals } = require('../../backend/utils')
const { timeFmtDb, dateNowUTC } = dateutils
const { bigD, d, weiToDisplay, displayToWei } = decimals

const run = async () => {
  try {

    const [owner, controller, recipient1, recipient2] = await ethers.getSigners()
    console.log(owner.address)
    const balance = await ethers.provider.getBalance(owner.address)
    console.log('Owner Balance: ' + d(balance, 18))

    const Contract = await hre.ethers.getContractFactory("Mammals")
    const baseUri = 'https://' + process.env.BASE_CID + '.ipfs.nftstorage.link/'
    const contractUri = 'https://' + process.env.BASE_CID + '.ipfs.nftstorage.link/contract.json'

    const contract = await Contract.deploy(
      baseUri,
      contractUri,
      process.env.ROYALTY_PERC,
      controller.address
    );
    await contract.deployed();

    contractAddress = contract.address
    console.log("EZNFT contract deployed to:", contractAddress)

    const value = String(displayToWei('0.01', 18))
    const tokenIds = []
    const provenances = []
    provenance.forEach((item) => {
      tokenIds.push(item.tokenId)
      provenances.push(item.provenance)
    })
    await contract.connect(controller).setProvenance(tokenIds, provenances)
    console.log('Provenance was set.')

    await contract.publicMint({ value: value })
    await contract.publicMint({ value: value })
    console.log(await contract.tokenCounter())

    const uri = await contract.tokenURI(1)
    console.log(uri)

    console.log(await contract.owner())

    console.log('getRaribleV2Royalties()', await contract.getRaribleV2Royalties(1)) // display royalties for id 0
    console.log('supportsInterface()', await contract.supportsInterface('0xcad96cca')) // the rarible interface hex id
    console.log('royaltyInfo()', await contract.royaltyInfo(0, 12345678)) // id, salePrice

    // contract.allowListMint()
    console.log(await contract.tokenURI(1))
    console.log('provenance: ' + await contract.getProvenance(1))
    console.log(await contract.tokenURI(2))
    console.log('provenance: ' + await contract.getProvenance(2))
    console.log(await contract.contractURI())

    // await contract.pauseItem(0)
    console.log('Item is paused? ' + await contract.itemIsPaused(1))
    console.log('Transfer 1', owner.address, ' -> ', recipient1.address)
    await contract.transferFrom(owner.address, recipient1.address, 1)
    console.log(await contract.balanceOf(recipient1.address))
    console.log('Transfer 2', recipient1.address, ' -> ', recipient2.address)
    await contract.connect(recipient1).transferFrom(recipient1.address, recipient2.address, 1)
    console.log('royaltyInfo()', await contract.royaltyInfo(1, 12345678)) // id, salePrice
    // console.log(Object.keys(contract))
  } catch (error) {
    console.log(error)
  }
  process.exit()
}



  ; (async () => {
    await run()
  })()