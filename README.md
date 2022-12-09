                                           
 _____ _____ _____ _____ _____ __    _____ 
|     |  _  |     |     |  _  |  |  |   __|
| | | |     | | | | | | |     |  |__|__   |
|_|_|_|__|__|_|_|_|_|_|_|__|__|_____|_____|
https://opensea.io/collection/snowkids-mammals                

Mammals - A test NFT that was pushed to production for the purpose of example

View on etherscan: https://etherscan.io/address/0xd8c92d615a705ecc344ea08257ae81af1a83f535

This NFT requires you set the provenance of an NFT before it can be minted. This can be useful for an artist who is producing several pieces of work over a long time.

The Characters: 

I drew these myself in 2014

Snow - White tiger, blue eyes (Commonly used as my avatar on everything)
Tony - Orange tiger, brown eyes
Poom - White Water Buffalo, closed eyes
Bigfoot - Black Water Buffalo, black eyes
Allan and Steve - 2 Green Parrots, red eyes

Features:
provenance uses a special algorithm to determine the exact combination of metadata and image
compatible with (new) NFT royalty standards on open sea and rarible

This is the code that was used to deploy the mammals erc721 contract. 

Out of the box there may be some linking issues with the scripts. The scripts will expect to see some libraries I use as well as data generated to link and prove the assets, which are in the media and metadata directory 
(TODO: do a test run now that everything is consolidated here)

The provenance algorithm:

```
  proveItem: async(imagePath, jsonPath) => {
    console.log(imagePath, jsonPath)
    const image = await fs.readFileSync(imagePath, 'utf8')
    const json = await fs.readFileSync(jsonPath, 'utf8')
    const conc = image + json
    const bufferObj = Buffer.from(conc, "utf8")
    const hash = crypto.createHash('sha256')
    hash.update(bufferObj.toString("base64"))
    const enc = hash.digest('hex')
    return enc.slice(0, 24)
  }
```

Hope you've enjoyed the project 
I accept tips:
![0xEBE40BB6FAa9AC01B2eda5c3917Bc3Bb8Bb76437](/media/tipaddress.png "TIPZZZ")