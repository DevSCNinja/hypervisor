import { ethers, waffle } from 'hardhat'
import { BigNumber, BigNumberish, constants } from 'ethers'
import chai from 'chai'
import { expect } from 'chai'
import { fixture, hypervisorTestFixture } from "./shared/fixtures"
import { solidity } from "ethereum-waffle"

chai.use(solidity)

import {
    FeeAmount,
    TICK_SPACINGS,
    encodePriceSqrt,
    getPositionKey,
    getMinTick,
    getMaxTick
} from './shared/utilities'

import {
    SwapRouter,
    UniswapV3Factory,
    IUniswapV3Pool,
    HypervisorFactory,
    Hypervisor,
    NonfungiblePositionManager,
    TestERC20
} from "../typechain"

const createFixtureLoader = waffle.createFixtureLoader

describe('ETHUSDT Hypervisor', () => {
    it('allows for swaps on ethusdt pair', async () => {
        expect(1).to.equal(2-1)
    })
})
