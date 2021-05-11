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
    /*
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
        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'))
        // check tokens into uniswapV3pool after Alice deposit
        expect(await token0.balanceOf(poolAddress)).to.equal(ethers.utils.parseEther('1000'))
        expect(await token1.balanceOf(poolAddress)).to.equal(ethers.utils.parseEther('1000'))
        // check hypervisor's liquidity info after Alice deposit
        const { _liquidity : liquidityHypervisor } = await uniswapPool.positions(
            getPositionKey(hypervisor.address, -887220, 887220)
        )
        expect(liquidityHypervisor).to.equal(ethers.utils.parseEther('1000.000000000000000054'))
        // check that Alice liquidity info is empty
        const { _liquidity : liquidityAlice } = await uniswapPool.positions(
            getPositionKey(alice.address, -887220, 887220)
        )
        expect(liquidityAlice).to.equal(ethers.utils.parseEther('0'))
        // check Alice hypervisorLP tokens
        expect(await hypervisor.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('1000.000000000000000054'))
    })

    describe('after deposit', () => {
        beforeEach('alice deposit tokens into hypervisor', async () => {
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
            await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'))
        })

        it('alice can add liquidity to existing position', async () => {
            await hypervisor.connect(alice).deposit(ethers.utils.parseEther('500'), ethers.utils.parseEther('500'))

            // check tokens into uniswapV3pool after Alice deposit
            expect(await token0.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('1500'))
            expect(await token1.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('1500'))
            // check hypervisor's liquidity info after Alice deposit
            const { _liquidity : liquidityHypervisor } = await uniswapPool.positions(
                getPositionKey(hypervisor.address, -887220, 887220)
            )
            expect(liquidityHypervisor).to.equal(ethers.utils.parseEther('1500.000000000000000081'))
            // check that Alice liquidity info is empty
            const { _liquidity : liquidityAlice } = await uniswapPool.positions(
                getPositionKey(alice.address, -887220, 887220)
            )
            expect(liquidityAlice).to.equal(ethers.utils.parseEther('0'))
            // check Alice hypervisorLP tokens
            expect(await hypervisor.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('1500.000000000000000081'))
        })

        it('alice can withdraw part of liquidity', async () => {
            await hypervisor.connect(alice).withdraw(ethers.utils.parseEther('500'))

            // check tokens into uniswapV3pool after Alice withdraw
            expect(await token0.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('500.000000000000000028'))
            expect(await token1.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('500.000000000000000028'))
            // check Alice balance after Alice withdraw
            expect(await token0.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('999499.999999999999999972'))
            expect(await token1.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('999499.999999999999999972'))
            // check hypervisor's liquidity info after Alice withdraw
            const { _liquidity } = await uniswapPool.positions(
                getPositionKey(hypervisor.address, -887220, 887220)
            )
            expect(_liquidity).to.equal(ethers.utils.parseEther('500.000000000000000054'))
            // check Alice hypervisorLP tokens
            expect(await hypervisor.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('500.000000000000000054'))
        })

        it('alice can withdraw all liquidity', async () => {
            await hypervisor.connect(alice).withdraw(ethers.utils.parseEther('1000.000000000000000054'))

            // check tokens into uniswapV3pool after Alice withdraw
            expect(await token0.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('0.000000000000000001'))
            expect(await token1.balanceOf(uniswapPool.address)).to.equal(ethers.utils.parseEther('0.000000000000000001'))
            // check Alice balance after Alice withdraw
            expect(await token0.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('999999.999999999999999999'))
            expect(await token1.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('999999.999999999999999999'))
            // check hypervisor's liquidity info after Alice withdraw
            const { _liquidity } = await uniswapPool.positions(
                getPositionKey(hypervisor.address, -887220, 887220)
            )
            expect(_liquidity).to.equal(ethers.utils.parseEther('0'))
            // check Alice hypervisorLP tokens
            expect(await hypervisor.balanceOf(alice.address)).to.equal(ethers.utils.parseEther('0'))
        })

        it('test rebalance', async () => {
            await hypervisor.rebalance(-443580, 443580)
            await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'))
            const { _liquidity } = await uniswapPool.positions(
                getPositionKey(hypervisor.address, -443580, 443580)
            )
            expect(_liquidity).to.equal(ethers.utils.parseEther('2000.000000466975676997'))
        })


        describe('connect Bob\'s wallet', () => {
            beforeEach('create Bob\'s balance', async () => {
                await token0.mint(bob.address, ethers.utils.parseEther('1000000'))
                await token1.mint(bob.address, ethers.utils.parseEther('1000000'))

                await token0.connect(bob).approve(router.address, ethers.utils.parseEther('1000000'))
                await token1.connect(bob).approve(router.address, ethers.utils.parseEther('1000000'))
            })

            it('test swap', async () => {
                await hypervisor.rebalance(-443580, 443580)
                await router.connect(bob).exactInputSingle({
                    tokenIn: token0.address,
                    tokenOut: token1.address,
                    fee: 3000,
                    recipient: bob.address,
                    deadline: 2000000000, // Wed May 18 2033 03:33:20 GMT+0000
                    amountIn:ethers.utils.parseEther('600'),
                    amountOutMinimum:ethers.utils.parseEther('200'),
                    sqrtPriceLimitX96: 0,
                })
                const bobBalance0 = await token0.balanceOf(bob.address)
                const bobBalance1 = await token1.balanceOf(bob.address)
                const poolBalance0 = await token0.balanceOf(uniswapPool.address)
                const poolBalance1 = await token1.balanceOf(uniswapPool.address)
                console.log('bob balances:', bobBalance0.toString(), bobBalance1.toString())
                console.log('pool balances:', poolBalance0.toString(), poolBalance1.toString())
                const { _liquidity, tokensOwed0, tokensOwed1 } = await uniswapPool.positions(
                    getPositionKey(hypervisor.address, -443580, 443580)
                )
                console.log('_liquidity:', _liquidity.toString())
                console.log('tokensOwed0:', tokensOwed0.toString())
                console.log('tokensOwed1:', tokensOwed1.toString())
            })
        })
    })
    */
})
