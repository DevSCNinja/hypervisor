## Hypervisor

Visor Hypervisor active liquidity management contract.

### Audit
[REP-Hypervisor-2021-07-07.pdf](https://github.com/VisorFinance/hypervisor/blob/master/REP-Hypervisor-2021-07-07.pdf)

### Testing

`npx hardhat test`

To deploy, modify the parameters in `scripts/deploy_mainnet.sh` and run:

`npx hardhat deploy_mainnet`

To trigger a rebalance, run:

`npx hardhat rebalance`

#### Fork Test

`npm run test`
