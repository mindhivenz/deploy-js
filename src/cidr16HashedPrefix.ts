// @ts-ignore
import hashMod from 'hash-mod/lib'

const hash = hashMod(256)

export default (hashKey: string) => `10.${hash(hashKey)}`
