
const path = require('path')

let arg = '../spec/api.json'
if (process.argv.length > 2) {
  arg = path.resolve(process.argv[2])
}

const OpenAPISchemaValidator = require('openapi-schema-validator').default
const validator = new OpenAPISchemaValidator({
  version: 3
})

const apiDoc = require(arg)
const result = validator.validate(apiDoc)

if (result.errors.length > 0) {
  console.log(result)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}
