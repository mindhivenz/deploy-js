import hash from 'hash-mod'


export default proj =>
  `10.${hash(256)(proj)}`
