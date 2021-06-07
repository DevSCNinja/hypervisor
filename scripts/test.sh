#!/bin/bash

if [ ! -d "$(pwd)/artifacts" ]; then
  hardhat compile
fi

hardhat test --network forking test/usdt.test.ts
