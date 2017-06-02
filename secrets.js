const secrets = require('./dist/secrets')


module.exports.getSecretText = secrets.getSecretText
module.exports.getSecretJson = secrets.getSecretJson
module.exports.setSecretText = secrets.setSecretText
module.exports.setSecretJson = secrets.setSecretJson
module.exports.readStdInSecretText = secrets.readStdInSecretText
module.exports.readStdInSecretJson = secrets.readStdInSecretJson
