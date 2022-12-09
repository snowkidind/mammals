// Use:
// node scripts/5_etherscan.js -n goerli

// npx hardhat verify--network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
const { exec } = require("child_process")
const env = require('node-env-file')
env(__dirname + '/../.env')
const { file } = require('../utils')

const verify = async (network) => {

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

  const deployData = await file.readFile(__dirname + '/' + network + '/1.json')
  if (typeof deployData === 'undefined') {
    console.log('Could not locate file to extract contract address to verify')
    process.exit(1)
  }
  const contract = JSON.parse(deployData).contract

  const parameterString =
    baseUri + ' ' + 
    contractUri + ' ' + 
    process.env.ROYALTY_PERC + ' ' + 
    process.env.CONTROLLER_ADDRESS

  console.log('npx hardhat verify --network ' + network + ' ' + contract + ' ' + parameterString)
  
  const executionString = 'npx hardhat verify --network ' + network + ' ' + contract + ' ' + parameterString

  const result = new Promise((resolve) => {
    console.log('executing')
    exec(executionString, (error, stdout, stderr) => {
      if (error) { console.log(error.message) }
      if (stderr) { console.log(stderr) }
      console.log(stdout.replace(/\n*$/, ""))
      resolve()
    })
  })

  await result
  console.log('Process Completed.')
}

  ; (async () => {
    const args = process.argv.slice(2);
    let found = false
    for (let i = 0; i < args.length; i++) {
      if (i % 2 === 0) {
        if (args[i].toLowerCase() === '-n') {
          found = true
          if (args.length > i + 1) {
            await verify(args[i + 1])
          }
        }
      }
    }
    if (!found) console.log('Dont use hardhat, use node.. node scripts/5_etherscan.js -n goerli')
    process.exit(0)
  })()
