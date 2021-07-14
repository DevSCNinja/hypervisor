## `Hypervisor`





### `onlyOwner()`






### `constructor(address _pool, address _owner)` (public)





### `deposit(uint256 deposit0, uint256 deposit1, address to) → uint256 shares` (external)





### `withdraw(uint256 shares, address to, address from) → uint256 amount0, uint256 amount1` (external)





### `rebalance(int24 _baseLower, int24 _baseUpper, int24 _limitLower, int24 _limitUpper, address feeRecipient, int256 swapQuantity)` (external)





### `_mintLiquidity(int24 tickLower, int24 tickUpper, uint128 liquidity, address payer) → uint256 amount0, uint256 amount1` (internal)





### `_burnLiquidity(int24 tickLower, int24 tickUpper, uint128 liquidity, address to, bool collectAll) → uint256 amount0, uint256 amount1` (internal)





### `_liquidityForShares(int24 tickLower, int24 tickUpper, uint256 shares) → uint128` (internal)





### `_position(int24 tickLower, int24 tickUpper) → uint128 liquidity, uint128 tokensOwed0, uint128 tokensOwed1` (internal)





### `uniswapV3MintCallback(uint256 amount0, uint256 amount1, bytes data)` (external)





### `uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes data)` (external)





### `getTotalAmounts() → uint256 total0, uint256 total1` (public)





### `getBasePosition() → uint128 liquidity, uint256 amount0, uint256 amount1` (public)





### `getLimitPosition() → uint128 liquidity, uint256 amount0, uint256 amount1` (public)





### `_amountsForLiquidity(int24 tickLower, int24 tickUpper, uint128 liquidity) → uint256, uint256` (internal)





### `_liquidityForAmounts(int24 tickLower, int24 tickUpper, uint256 amount0, uint256 amount1) → uint128` (internal)





### `currentTick() → int24 tick` (public)





### `_uint128Safe(uint256 x) → uint128` (internal)





### `setMaxTotalSupply(uint256 _maxTotalSupply)` (external)





### `setDepositMax(uint256 _deposit0Max, uint256 _deposit1Max)` (external)






