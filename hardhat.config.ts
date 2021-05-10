import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import './scripts/copy-uniswap-v3-artifacts.ts'

export default {
    networks: {
        hardhat: {
            allowUnlimitedContractSize: false,
        },
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
}
