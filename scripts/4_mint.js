const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const hre = require("hardhat");
const ethers = hre.ethers

const provider = hre.network.provider
const BigNumber = ethers.BigNumber

const { decimals, file } = require('../utils')
const { d, displayToWei } = decimals

const run = async () => {

  const network = process.env.HARDHAT_NETWORK;
  if (typeof (network) === 'undefined') {
    console.log("Try: npx hardhat run --network <network> filepath");
    process.exit(1);
  }

  if (network !== 'hardhat' && network !== 'mainnet' && network !== 'goerli' && network !== 'sepolia') {
    console.log("Unsupported Network");
    process.exit(1);
  }

  const [owner, controller, minter] = await ethers.getSigners()

  console.log('This script is called from the perspective of the minter.')
  console.log("\nThe minter address is: " + minter.address);
  console.log("The current network to broadcast on is: " + network)
  const balance = await ethers.provider.getBalance(minter.address)
  console.log('minter ETH balance: ' + d(balance, 18))
  if (Number(balance) < 100) {
    console.log('ETH Balance for ' + minter.address + ' is insufficient: ' + Number(balance))
    process.exit(1)
  }

  // read from a file to get deployed contract address
  console.log()
  const data = await file.readFile(__dirname + '/' + network + '/1.json')
  if (typeof data === 'undefined') {
    console.log('unable to find implementation on network: ' + network)
    process.exit(1)
  }
  const contractAddress = JSON.parse(data).contract
  console.log('Contract was previously deployed to ' + contractAddress + ' on network: ' + network + '\n')

  const Contract = await hre.ethers.getContractFactory("Mammals");
  const contract = await Contract.attach(contractAddress);
  let counter = await contract.tokenCounter()

  // In order to mint a new token the provenance must already be set
  console.log('Checking provenance for new token: ' + counter)
  const provenance = await contract.getProvenance(counter)
  if (provenance.length < 1) {
    console.log('Cannot continue: Provenance was not set for token: ' + counter)
    process.exit(1)
  }
  console.log('Provenance was set: ' + provenance)

  const answer = await getAnswer('Mint tokens?? (y n)')
  if (answer === 'y') {
    const tx = await contract.connect(minter).publicMint({ value: BigNumber.from(displayToWei('0.01', 18)) })
    const receipt = await tx.wait()
    console.log(receipt)
    console.log('A token was minted.')
    counter = await contract.tokenCounter()
  }
  const tokenBalance = await contract.balanceOf(minter.address)
  console.log('Minter posesses: ' + tokenBalance.toString() + ' NFTs')

  for (let i = 1; i < counter; i++) {
    console.log('OwnerOf tokenId ' + i + ': ' + await contract.ownerOf(i))
    console.log('URI: ' + await contract.tokenURI(i))
    console.log('Provenance: ' + await contract.getProvenance(i))
  }
}

const getAnswer = (message) => {
  return new Promise((resolve) => {
    rl.question(message + '\n > ', async (answer) => {
      if (answer === 'c') {
        console.log('Operation Cancelled')
        process.exit(1)
      }
      resolve(answer)
    })
  })
}

  ; (async () => {
    try {
      await run()
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
    process.exit(0)
  })()