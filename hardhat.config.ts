import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import './scripts/copy-uniswap-v3-artifacts.ts'
// import './tasks/hypervisor'
import { parseUnits } from 'ethers/lib/utils'
require('dotenv').config()
const mnemonic = process.env.DEV_MNEMONIC || ''
const archive_node = process.env.ETHEREUM_ARCHIVE_URL || ''

export default {
    networks: {
        hardhat: {
            allowUnlimitedContractSize: false,
        },
        goerli: {
          url: 'https://goerli.infura.io/v3/' + process.env.INFURA_ID,
          accounts: {
            mnemonic,
          },
          gasPrice: parseUnits('130', 'gwei').toNumber(),
        },
        bsc: {
          url: 'https://bsc-dataseed1.binance.org',
          accounts: {
            mnemonic,
          },
          // gasPrice: parseUnits('130', 'gwei').toNumber(),
        },
        mainnet: {
          url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_ID,
          accounts: {
            mnemonic,
          },
        }
    },
    watcher: {
        compilation: {
            tasks: ["compile"],
        }
    },
    solidity: {
        version: '0.7.6',
        settings: {
            optimizer: {
                enabled: true,
                runs: 800,
            },
            metadata: {
                // do not include the metadata hash, since this is machine dependent
                // and we want all generated code to be deterministic
                // https://docs.soliditylang.org/en/v0.7.6/metadata.html
                bytecodeHash: 'none',
            },
        },
    },
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  mocha: {
    timeout: 2000000
  }
}
