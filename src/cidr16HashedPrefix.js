import hashMod from 'hash-mod/lib'

const hash = hashMod(256)

export default hashKey => `10.${hash(hashKey)}`
