import * as CardanoWasm from '@emurgo/cardano-serialization-lib-asmjs/cardano_serialization_lib.js'

export const buildUrl = function (address: string, markdown: string) {
  return `${process.env.REACT_APP_ADA_COFFEE_URL}/donate/?markdown=${encodeURIComponent(
    markdown,
  )}&address=${encodeURIComponent(address)}`
}

export const isValidAddress = function (address: string) {
  try {
    CardanoWasm.Address.from_bech32(address)
    return true
  } catch (e) {
    return false
  }
}

export const isValidUrl = function (url: string) {
  return url.length < 2000
}

export const buildMarkdown = function (url: string) {
  return (
    `[<img src="${process.env.REACT_APP_ADA_COFFEE_URL}/cardano.png" style='height: 50px;border-radius: 22px;'>](` +
    url +
    ')'
  )
}
