import {
  Address,
  BigNum,
  LinearFee,
  Transaction,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutput,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionWitnessSet,
  Value,
} from '@emurgo/cardano-serialization-lib-asmjs'
import {Buffer} from 'buffer';
import {toast} from "react-hot-toast";

declare global {
  interface Window {

    cardano: any
  }
}

export default class Cardano {
  private readonly provider: any

  private readonly apiKey: any

  /**
   * Protocol parameters
   * @type {{
   * keyDeposit: string,
   * coinsPerUtxoWord: string,
   * minUtxo: string,
   * poolDeposit: string,
   * maxTxSize: number,
   * priceMem: number,
   * maxValSize: number,
   * linearFee: {minFeeB: string, minFeeA: string}, priceStep: number
   * }}
   */
  private protocolParams: any = {
    linearFee: {
      minFeeA: '44',
      minFeeB: '155381',
    },
    minUtxo: '34482',
    poolDeposit: '500000000',
    keyDeposit: '2000000',
    maxValSize: 5000,
    maxTxSize: 16384,
    priceMem: 0.0577,
    priceStep: 0.0000721,
    coinsPerUtxoWord: '34482',
  }
  /**
   * When the wallet is connect it returns the connector which is
   * written to this API variable and all the other operations
   * run using this API object
   */
  private API: any = undefined

  public state: any = {
    whichWalletSelected: undefined,
    walletFound: false,
    walletIsEnabled: false,
    walletName: undefined,
    walletIcon: undefined,
    walletAPIVersion: undefined,
    wallets: [],

    networkId: undefined,
    Utxos: undefined,
    collatUtxos: undefined,
    balance: undefined,
    changeAddress: undefined,
    rewardAddress: undefined,
    usedAddress: undefined,
  }

  constructor() {
    this.provider = process.env.PROVIDER
    this.apiKey = process.env.API_KEY
  }

  /**
   * Poll the wallets it can read from the browser.
   * Sometimes the html document loads before the browser initialized browser plugins (like Nami or Flint).
   * So we try to poll the wallets 3 times (with 1 second in between each try).
   *
   * Note: CCVault and Eternl are the same wallet, Eternl is a rebrand of CCVault
   * So both of these wallets as the Eternl injects itself twice to maintain
   * backward compatibility
   *
   * @param count The current try count.
   */
  pollWallets = (count = 0) => {
    const wallets: string[] = []
    for (const key in window.cardano) {
      if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
        wallets.push(key)
      }
    }
    if (wallets.length === 0 && count < 3) {
      setTimeout(() => {
        this.pollWallets(count + 1)
      }, 1000)
      return
    }
    this.state = { ...this.state, wallets, whichWalletSelected: wallets[0] }
    this.refreshData()
  }

  /**
   * Sets the users wallet to work with
   * @param wallet
   */
  selectWallet = (wallet: string) => {
    this.state = { ...this.state, whichWalletSelected: wallet }
    this.refreshData()
  }

  /**
   * Checks if the wallet is running in the browser
   * Does this for Nami, Eternl and Flint wallets
   * @returns {boolean}
   */

  checkIfWalletFound = () => {
    const walletKey = this.state.whichWalletSelected
    const walletFound = !!window?.cardano?.[walletKey]
    this.state = { ...this.state, walletFound }
    return walletFound
  }

  /**
   * Checks if a connection has been established with
   * the wallet
   * @returns {Promise<boolean>}
   */
  checkIfWalletEnabled = async () => {
    let walletIsEnabled = false

    try {
      const walletName = this.state.whichWalletSelected
      walletIsEnabled = await window.cardano[walletName].isEnabled()
    } catch (err) {
      toast.error('Wallet not enabled')
    }
    this.state = { ...this.state, walletIsEnabled }
    return walletIsEnabled
  }

  /**
   * Enables the wallet that was chosen by the user
   * When this executes the user should get a window pop-up
   * from the wallet asking to approve the connection
   * of this app to the wallet
   * @returns {Promise<boolean>}
   */

  enableWallet = async () => {
    const walletKey = this.state.whichWalletSelected
    try {
      this.API = await window.cardano[walletKey].enable()
    } catch (err) {
      toast.error('Error enabling wallet')
    }
    return this.checkIfWalletEnabled()
  }

  /**
   * Get the API version used by the wallets
   * writes the value to state
   * @returns {*}
   */
  getAPIVersion = () => {
    const walletKey = this.state.whichWalletSelected
    const walletAPIVersion = window?.cardano?.[walletKey].apiVersion
    this.state = { ...this.state, walletAPIVersion }
    return walletAPIVersion
  }

  /**
   * Get the name of the wallet (nami, eternl, flint)
   * and store the name in the state
   * @returns {*}
   */

  getWalletName = () => {
    const walletKey = this.state.whichWalletSelected
    const walletName = window?.cardano?.[walletKey].name
    this.state = { ...this.state, walletName }
    return walletName
  }

  /**
   * Gets the Network ID to which the wallet is connected
   * 0 = testnet
   * 1 = mainnet
   * Then writes either 0 or 1 to state
   * @returns {Promise<void>}
   */
  getNetworkId = async () => {
    try {
      const networkId = await this.API?.getNetworkId()
      this.state = { ...this.state, networkId }
    } catch (err) {
      toast.error('Error getting network Id')
    }
  }

  /**
   * Gets the UTXOs from the user's wallet and then
   * stores in an object in the state
   * @returns {Promise<void>}
   */

  getUtxos = async () => {
    const Utxos: any = []

    try {
      const rawUtxos = await this.API.getUtxos()

      for (const rawUtxo of rawUtxos) {
        const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, 'hex'))
        const input = utxo.input()
        const txid = Buffer.from(input.transaction_id().to_bytes()).toString('hex')
        const txindx = input.index()
        const output = utxo.output()
        const amount = output.amount().coin().to_str() // ADA amount in lovelace
        const multiasset = output.amount().multiasset()
        let multiAssetStr = ''

        if (multiasset) {
          const keys = multiasset.keys() // policy Ids of thee multiasset
          const N = keys.len()

          for (let i = 0; i < N; i++) {
            const policyId = keys.get(i)
            const policyIdHex = Buffer.from(policyId.to_bytes()).toString('hex')
            const assets = multiasset.get(policyId)
            if (assets !== undefined) {
              const assetNames = assets.keys()
              const K = assetNames.len()

              for (let j = 0; j < K; j++) {
                const assetName = assetNames.get(j)
                const assetNameString = Buffer.from(assetName.name()).toString()
                const assetNameHex = Buffer.from(assetName.name()).toString('hex')
                const multiassetAmt = multiasset.get_asset(policyId, assetName)
                multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
              }
            }
          }
        }

        const obj = {
          txid: txid,
          txindx: txindx,
          amount: amount,
          str: `${txid} #${txindx} = ${amount}`,
          multiAssetStr: multiAssetStr,
          TransactionUnspentOutput: utxo,
        }
        Utxos.push(obj)
      }
      this.state = { ...this.state, Utxos }
    } catch (err) {
      toast.error('Error getting UTXOS')
    }
  }

  /**
   * The collateral is need for working with Plutus Scripts
   * Essentially you need to provide collateral to pay for fees if the
   * script execution fails after the script has been validated...
   * this should be an uncommon occurrence and would suggest the smart contract
   * would have been incorrectly written.
   * The amount of collateral to use is set in the wallet
   * @returns {Promise<void>}
   */
  getCollateral = async () => {
    const CollatUtxos: any = []

    try {
      let collateral;

      const wallet = this.state.whichWalletSelected
      if (wallet === 'nami') {
        collateral = await this.API.experimental.getCollateral()
      } else {
        collateral = await this.API.getCollateral()
      }

      for (const x of collateral) {
        const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, 'hex'))
        CollatUtxos.push(utxo)
      }
      this.state = { ...this.state, CollatUtxos }
    } catch (err) {
      toast.error('Error getting collateral')
    }
  }

  /**
   * Gets the current balance of in Lovelace in the user's wallet
   * This doesnt resturn the amounts of all other Tokens
   * For other tokens you need to look into the full UTXO list
   * @returns {Promise<void>}
   */
  getBalance = async () => {
    try {
      const balanceCBORHex = await this.API.getBalance()

      const balance = Value.from_bytes(Buffer.from(balanceCBORHex, 'hex')).coin().to_str()
      this.state = { ...this.state, balance }
    } catch (err) {
      toast.error('Error getting balance')
    }
  }

  /**
   * Get the address from the wallet into which any spare UTXO should be sent
   * as change when building transactions.
   * @returns {Promise<void>}
   */
  getChangeAddress = async () => {
    try {
      const raw = await this.API.getChangeAddress()
      const changeAddress = Address.from_bytes(Buffer.from(raw, 'hex')).to_bech32()

      this.state = { ...this.state, changeAddress }
    } catch (err) {
      toast.error('Error getting change address')
    }
  }

  /**
   * This is the Staking address into which rewards from staking get paid into
   * @returns {Promise<void>}
   */
  getRewardAddresses = async () => {
    try {
      const raw = await this.API.getRewardAddresses()
      const rawFirst = raw[0]
      const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, 'hex')).to_bech32()
      this.state = { ...this.state, rewardAddress }
    } catch (err) {
      toast.error('Error getting reward address')
    }
  }

  /**
   * Gets previsouly used addresses
   * @returns {Promise<void>}
   */
  getUsedAddresses = async () => {
    try {
      const raw = await this.API.getUsedAddresses()
      const rawFirst = raw[0]
      const usedAddress = Address.from_bytes(Buffer.from(rawFirst, 'hex')).to_bech32()
      this.state = { ...this.state, usedAddress }
    } catch (err) {
      toast.error('Error getting used addresses')
    }
  }

  /**
   * Refresh all the data from the user's wallet
   * @returns {Promise<void>}
   */
  refreshData = async () => {
    try {
      const walletFound = this.checkIfWalletFound()
      if (walletFound) {
        await this.getAPIVersion()
        await this.getWalletName()
        const walletEnabled = await this.enableWallet()
        if (walletEnabled) {
          await this.getNetworkId()
          await this.getUtxos()
          await this.getCollateral()
          await this.getBalance()
          await this.getChangeAddress()
          await this.getRewardAddresses()
          await this.getUsedAddresses()
        } else {
          this.state = {
            ...this.state,
            Utxos: null,
            CollatUtxos: null,
            balance: null,
            changeAddress: null,
            rewardAddress: null,
            usedAddress: null,

            txBody: null,
            txBodyCborHexUnsigned: '',
            txBodyCborHexSigned: '',
          }
        }
      } else {
        this.state = {
          ...this.state,
          walletIsEnabled: false,

          Utxos: null,
          CollatUtxos: null,
          balance: null,
          changeAddress: null,
          rewardAddress: null,
          usedAddress: null,

          txBody: null,
          txBodyCborHexUnsigned: '',
          txBodyCborHexSigned: '',
        }
      }
    } catch (err) {
      toast.error('Error refreshing data')
    }
  }

  /**
   * Every transaction starts with initializing the
   * TransactionBuilder and setting the protocol parameters
   * This is boilerplate
   * @returns {Promise<TransactionBuilder>}
   */
  initTransactionBuilder = async () => {
    return TransactionBuilder.new(
      TransactionBuilderConfigBuilder.new()
        .fee_algo(
          LinearFee.new(
            BigNum.from_str(this.protocolParams.linearFee.minFeeA),
            BigNum.from_str(this.protocolParams.linearFee.minFeeB),
          ),
        )
        .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
        .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
        .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
        .max_value_size(this.protocolParams.maxValSize)
        .max_tx_size(this.protocolParams.maxTxSize)
        .prefer_pure_change(true)
        .build(),
    )
  }

  /**
   * Builds an object with all the UTXOs from the user's wallet
   * @returns {Promise<TransactionUnspentOutputs>}
   */
  getTxUnspentOutputs = async () => {
    const txOutputs = TransactionUnspentOutputs.new()
    for (const utxo of this.state.Utxos) {
      txOutputs.add(utxo.TransactionUnspentOutput)
    }
    return txOutputs
  }

  /**
   * The transaction is build in 3 stages:
   * 1 - initialize the Transaction Builder
   * 2 - Add inputs and outputs
   * 3 - Calculate the fee and how much change needs to be given
   * 4 - Build the transaction body
   * 5 - Sign it (at this point the user will be prompted for
   * a password in his wallet)
   * 6 - Send the transaction
   * @returns {Promise<void>}
   */
  buildSendADATransaction = async (address: string,lovelaceToSend:number) => {
    const txBuilder = await this.initTransactionBuilder()
    const shelleyOutputAddress = Address.from_bech32(address)
    const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

    txBuilder.add_output(
      TransactionOutput.new(
        shelleyOutputAddress,
        Value.new(BigNum.from_str(lovelaceToSend.toString())),
      ),
    )

    // Find the available UTXOs in the wallet and
    // us them as Inputs
    const txUnspentOutputs = await this.getTxUnspentOutputs()
    txBuilder.add_inputs_from(txUnspentOutputs, 1)

    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress)

    // once the transaction is ready, we build it to get the tx body without witnesses
    const txBody = txBuilder.build()

    // Tx witness
    const transactionWitnessSet = TransactionWitnessSet.new()

    const tx = Transaction.new(
      txBody,
      TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
    )

    let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes()).toString('hex'), true)

    txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, 'hex'))

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys())

    const signedTx = Transaction.new(tx.body(), transactionWitnessSet)

    return await this.API.submitTx(
      Buffer.from(signedTx.to_bytes()).toString('hex'),
    )
  }
}
