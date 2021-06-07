## Hypervisor

Visor Hypervisor Active liquiditiy management contract.

### Testing

`npx hardhat test`

To deploy, modify the parameters in `scripts/deploy_mainnet.sh` and run:

`npx hardhat deploy_mainnet`

To trigger a rebalance, run:

`npx hardhat rebalance`

## Inventory Risk Management (TODO)

- introduce swap functionality to rebalance in order to halt impermenant loss
and rebalance tokens quantities

## TODO

- contract fails when attempting swap with negative input value on mainnet contract. TEST this
```
In range: true
tick: -197324 price: $2696.2243114862354
-------------
baseLower: -197700
baseUpper: -196800
baseLower price: $2596.73
baseUpper price: $2841.27
limitLower: -197220
limitUpper: -197040
limitLower price: $2724.41
limitUpper price: $2773.89
-------------
Managed Assets
-------------
WETH $2789.59 USDT $11760.18
base position:  0.03 WETH 60.18 USDT
limit position:  0.00 WETH 0.00 USDT
unused WETH:  1.00
unused USDT:  11700.00
-------------
APY  100.00%
```
