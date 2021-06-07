## Hypervisor

Visor Hypervisor Active liquiditiy management contract.

### Testing

`npx hardhat test`

To deploy, modify the parameters in `scripts/deploy_mainnet.sh` and run:

`npx hardhat deploy_mainnet`

To trigger a rebalance, run:

`npx hardhat rebalance`

#### Fork Test

`npm run test`

## Inventory Risk Management (TODO)

- introduce swap functionality to rebalance in order to halt impermenant loss
and rebalance tokens quantities
