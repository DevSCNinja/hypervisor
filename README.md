## Hypervisor

Visor Hypervisor Active liquiditiy management contract.

### Testing

`npx hardhat test`

To deploy, modify the parameters in `scripts/deploy_mainnet.sh` and run:

`npx hardhat deploy_mainnet`

To trigger a rebalance, run:

`npx hardhat rebalance`

### TODO

- (1) convert all python tests to typescript ones
- remove most traces of charm
- add 10% fee collection for visor
    + test this fee collection
- add single-sided liquidity provision
    + use function that calculates proportion of tokens
    + use that to initiate swap on deposited tokens
