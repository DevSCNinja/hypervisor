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
- remove default theshold strategies, make it totally up to us
- add 10% fee collection for visor
- add single-sided liquidity provision
