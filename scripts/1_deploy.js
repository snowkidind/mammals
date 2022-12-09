const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const hre = require("hardhat");
const ethers = hre.ethers

const { decimals, file } = require('../utils')
const { d } = decimals

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

  const [owner] = await ethers.getSigners()

  console.log("\nThe current deployer address is: " + owner.address);
  console.log("The current network to deploy on is: " + network)

  const balance = await ethers.provider.getBalance(owner.address)
  if (Number(balance) < 100) {
    console.log('ETH Balance for ' + owner.address + ' is insufficient: ' + Number(balance))
    process.exit(1)
  }

  console.log('Deployer ETH balance: ' + d(balance, 18))

  const answer = await getAnswer('Continue? (y n)')
  if (answer !== 'y') { 
    console.log('Operation Canceled')
    process.exit(1)
  }

  function isSet(envVar) {
    if (!envVar || envVar === '' || envVar.length < 1) {
      return false
    }
    return true
  }

  if (!isSet(process.env.BASE_CID) || !isSet(process.env.ROYALTY_PERC) || !isSet(process.env.CONTROLLER_ADDRESS)) {
    console.log('Initializer Environment variables are not set properly.')
    process.exit(1)
  }

  const baseUri = 'https://' + process.env.BASE_CID + '.ipfs.nftstorage.link/'
  const contractUri = 'https://' + process.env.BASE_CID + '.ipfs.nftstorage.link/contract.json'
  const parameters = [
    baseUri,
    contractUri,
    process.env.ROYALTY_PERC,
    process.env.CONTROLLER_ADDRESS
  ]
  const Contract = await hre.ethers.getContractFactory("Mammals");
  const contract = await Contract.deploy(...parameters);
  await contract.deployed();
  contractAddress = contract.address
  console.log("MAMM contract deployed to: " + contractAddress + ' on ' + network)
  
  await file.writeFile(__dirname + '/' + network + '/1.json', JSON.stringify({contract:contractAddress}, null, 4))
}

const getAnswer =  (message) => {
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