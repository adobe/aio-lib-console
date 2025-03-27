const mapping = require('./mapping.json')
const apiJson = require('../api.json')
const fs = require('node:fs/promises')

/** @private */
async function main () {
  for (const [key, value] of Object.entries(mapping)) {
    const keyData = require(key)
    const destinationKey = value

    apiJson[destinationKey] = { ...apiJson[destinationKey], ...keyData }
  }

  return fs.writeFile(`${__dirname}/../api.json`, JSON.stringify(apiJson, null, 2))
}

main()
  .catch(console.error)
