#!/bin/bash

if [ ! -d "$(pwd)/artifacts" ]; then
  hardhat compile
fi

hardhat test --network hardhat test/mainnet_fork.test.ts
