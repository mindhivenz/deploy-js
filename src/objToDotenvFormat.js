

export default obj =>
  Object.entries(obj)
    .reduce(
      (result, [k, v]) => `${result}${k}=${v}\n`,
      '',
    )
