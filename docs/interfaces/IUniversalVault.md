## `IUniversalVault`






### `initialize()` (external)





### `lock(address token, uint256 amount, bytes permission)` (external)





### `unlock(address token, uint256 amount, bytes permission)` (external)





### `rageQuit(address delegate, address token) → bool notified, string error` (external)





### `transferERC20(address token, address to, uint256 amount)` (external)





### `transferETH(address to, uint256 amount)` (external)





### `calculateLockID(address delegate, address token) → bytes32 lockID` (external)





### `getPermissionHash(bytes32 eip712TypeHash, address delegate, address token, uint256 amount, uint256 nonce) → bytes32 permissionHash` (external)





### `getNonce() → uint256 nonce` (external)





### `owner() → address ownerAddress` (external)





### `getLockSetCount() → uint256 count` (external)





### `getLockAt(uint256 index) → struct IUniversalVault.LockData lockData` (external)





### `getBalanceDelegated(address token, address delegate) → uint256 balance` (external)





### `getBalanceLocked(address token) → uint256 balance` (external)





### `checkBalances() → bool validity` (external)






### `Locked(address delegate, address token, uint256 amount)`





### `Unlocked(address delegate, address token, uint256 amount)`





### `RageQuit(address delegate, address token, bool notified, string reason)`





