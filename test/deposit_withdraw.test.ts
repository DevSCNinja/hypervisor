import { ethers, waffle } from 'hardhat'
import { BigNumber, BigNumberish, constants } from 'ethers'
import { expect } from 'chai'
import {fixture, hypervisorTestFixture} from "./shared/fixtures"

import {
    FeeAmount,
    TICK_SPACINGS,
    encodePriceSqrt,
    getPositionKey,
} from './shared/utilities'

import {
    SwapRouter,
    UniswapV3Factory,
    IUniswapV3Pool,
    HypervisorFactory,
    Hypervisor,
    NonfungiblePositionManager,
    TestERC20
} from "../typechain";

const createFixtureLoader = waffle.createFixtureLoader

describe('Hypervisor', () => {
    const [wallet, alice, bob, other] = waffle.provider.getWallets()

    let factory: UniswapV3Factory
    let router: SwapRouter
    let nft: NonfungiblePositionManager
    let token0: TestERC20
    let token1: TestERC20
    let token2: TestERC20
    let uniswapPool: IUniswapV3Pool
    let hypervisorFactory: HypervisorFactory
    let hypervisor: Hypervisor


    let loadFixture: ReturnType<typeof createFixtureLoader>
    before('create fixture loader', async () => {
        loadFixture = createFixtureLoader([wallet, other])
    })

    beforeEach('deploy contracts', async () => {
        ({ token0, token1, token2, factory, router, nft, hypervisorFactory } = await loadFixture(hypervisorTestFixture))
    })

    it('deposit', async () => {
        await hypervisorFactory.createHypervisor(token0.address, token1.address, FeeAmount.MEDIUM)
        const hypervisorAddress = await hypervisorFactory.getHypervisor(token0.address, token1.address, FeeAmount.MEDIUM)
        hypervisor = (await ethers.getContractAt('Hypervisor', hypervisorAddress)) as Hypervisor

        const poolAddress = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM)
        uniswapPool = (await ethers.getContractAt('IUniswapV3Pool', poolAddress)) as IUniswapV3Pool
        await uniswapPool.initialize(encodePriceSqrt('1', '1'))

        await token0.mint(alice.address, ethers.utils.parseEther('1000000'))
        await token1.mint(alice.address, ethers.utils.parseEther('1000000'))

        await token0.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))
        await token1.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))
        await hypervisor.connect(alice).deposit(100000000000, ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'), alice.address)
        const token0Liq = await token0.balanceOf(poolAddress)
        const token1Liq = await token1.balanceOf(poolAddress)
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        // test withdrawal of liquidity
        await hypervisor.connect(alice).withdraw(100000000000, 0, 0, alice.address);
        // check tokens into uniswapV3pool after Alice deposit
        //expect(await token0.balanceOf(poolAddress)).to.equal(ethers.utils.parseEther('1000'))
        //expect(await token1.balanceOf(poolAddress)).to.equal(ethers.utils.parseEther('1000'))

        //// check hypervisor's liquidity info after Alice deposit
        //const { _liquidity : liquidityHypervisor } = await uniswapPool.positions(
        //    getPositionKey(hypervisor.address, -887220, 887220)
        //)
        //expect(liquidityHypervisor).to.equal(ethers.utils.parseEther('1000.000000000000000054'))
        //// check that Alice liquidity info is empty
        //const { _liquidity : liquidityAlice } = await uniswapPool.positions(
        //    getPositionKey(alice.address, -887220, 887220)
        //)
        //expect(liquidityAlice).to.equal(ethers.utils.parseEther('0'))
        //// check Alice hypervisorLP tokens
        //expect(await hypervisor.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('1000.000000000000000054'))
    })
})
