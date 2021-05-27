import { ethers, waffle } from 'hardhat'
import { BigNumber, BigNumberish, constants } from 'ethers'
import { expect } from 'chai'
import { fixture, hypervisorTestFixture } from "./shared/fixtures"

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
} from "../typechain";

const createFixtureLoader = waffle.createFixtureLoader

describe('Hypervisor', () => {
    const [wallet, alice, bob, carol, other,
           user0, user1, user2, user3, user4] = waffle.provider.getWallets()

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

    it('multiple deposits and total withdrawal', async () => {
        await hypervisorFactory.createHypervisor(token0.address, token1.address, FeeAmount.MEDIUM,-1800, 1800, -600, 0)
        const hypervisorAddress = await hypervisorFactory.getHypervisor(token0.address, token1.address, FeeAmount.MEDIUM)
        hypervisor = (await ethers.getContractAt('Hypervisor', hypervisorAddress)) as Hypervisor

        const poolAddress = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM)
        uniswapPool = (await ethers.getContractAt('IUniswapV3Pool', poolAddress)) as IUniswapV3Pool
        await uniswapPool.initialize(encodePriceSqrt('1', '1'))

        // adding extraliquidity into pool to make sure there's always
        // someone to swap with
        await token0.mint(carol.address, ethers.utils.parseEther('1000000000000'))
        await token1.mint(carol.address, ethers.utils.parseEther('1000000000000'))

        await token0.connect(carol).approve(nft.address, ethers.utils.parseEther('10000000000'))
        await token1.connect(carol).approve(nft.address, ethers.utils.parseEther('10000000000'))

        await nft.connect(carol).mint({
            token0: token0.address,
            token1: token1.address,
            tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
            tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
            fee: FeeAmount.MEDIUM,
            recipient: carol.address,
            amount0Desired: ethers.utils.parseEther('10000000000'),
            amount1Desired: ethers.utils.parseEther('10000000000'),
            amount0Min: 0,
            amount1Min: 0,
            deadline: 2000000000,
        })

        await token0.mint(alice.address, ethers.utils.parseEther('1000000'))
        await token1.mint(alice.address, ethers.utils.parseEther('1000000'))

        await token0.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))
        await token1.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))

        // alice should start with 0 hypervisor tokens
        let alice_liq_balance = await hypervisor.balanceOf(alice.address)
        expect(alice_liq_balance).to.equal(0)

        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'), alice.address)

        // TODO check alice's liquidity here

        console.log("after alice's 1st deposit");
        let token0Liq = await token0.balanceOf(poolAddress)
        let token1Liq = await token1.balanceOf(poolAddress)
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        alice_liq_balance = await hypervisor.balanceOf(alice.address)
        console.log("alice liq balance: " + alice_liq_balance)
        // check that alice has been awarded liquidity tokens
        expect(alice_liq_balance).to.be.gt(0)

        let resp = await hypervisor.getTotalAmounts()
        console.log("totalAmounts: " + resp)

        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('4000'), alice.address)
        token0Liq = await token0.balanceOf(poolAddress)
        token1Liq = await token1.balanceOf(poolAddress)
        console.log("after alice's 2nd deposit")
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        alice_liq_balance = await hypervisor.balanceOf(alice.address)
        console.log("alice liq balance: " + alice_liq_balance)

        resp = await hypervisor.getTotalAmounts()
        console.log("totalAmounts: " + resp)

        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('2000'), ethers.utils.parseEther('1000'), alice.address)
        token0Liq = await token0.balanceOf(poolAddress)
        token1Liq = await token1.balanceOf(poolAddress)
        console.log("after alice's 3rd deposit")
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        resp = await hypervisor.getTotalAmounts()
        console.log("totalAmounts: " + resp)

        // do a test swap
        console.log("Carol swap a huge quantity of coins, which should significantly impact hypervisor holdings-----")
        await token0.connect(carol).approve(router.address, ethers.utils.parseEther('10000000000'))
        await token1.connect(carol).approve(router.address, ethers.utils.parseEther('10000000000'))
        await router.connect(carol).exactInputSingle({
            tokenIn: token0.address,
            tokenOut: token1.address,
            fee: FeeAmount.MEDIUM,
            recipient: carol.address,
            deadline: 2000000000, // Wed May 18 2033 03:33:20 GMT+0000
            amountIn: ethers.utils.parseEther('1000000'),
            amountOutMinimum: ethers.utils.parseEther('0'),
            sqrtPriceLimitX96: 0,
        })

        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('6000'), ethers.utils.parseEther('1000'), alice.address)
        token0Liq = await token0.balanceOf(poolAddress)
        token1Liq = await token1.balanceOf(poolAddress)
        console.log("after alice's 4th deposit")
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        resp = await hypervisor.getTotalAmounts()
        console.log("totalAmounts BEFORE REBALANCE: " + resp)
        let limitUpper = -60
        let limitLower = -540
        const { tick: currentTick } = await uniswapPool.slot0()
        if (resp[0] < resp[1]) {
          expect(limitUpper).to.be.lt(currentTick)
          expect(limitLower).to.be.lt(currentTick)
        } else {
          expect(limitUpper).to.be.gt(currentTick)
          expect(limitLower).to.be.gt(currentTick)
        }

        console.log("owner balances before rebase (should be zero)")
        let fees0 = await token0.balanceOf(bob.address)
        let fees1 = await token1.balanceOf(bob.address)
        console.log("fees0: " + fees0.toString() + "\nfees1: " + fees1.toString())
        expect(fees0).to.equal(0)
        expect(fees1).to.equal(0)
        await hypervisor.rebalance(-1800, 1920, limitLower, limitUpper, bob.address);
        fees0 = await token0.balanceOf(bob.address)
        fees1 = await token1.balanceOf(bob.address)
        console.log("owner balances after rebase")
        console.log("fees0: " + fees0.toString() + "\nfees1: " + fees1.toString())
        // have the positions been updated? Are the token amounts unchanged?

        const { _liquidity : liquidityLimit } = await uniswapPool.positions(
            getPositionKey(alice.address, limitLower, limitUpper)
        )
        // TODO this limit position should be non-zero
        console.log("liq limit: " + liquidityLimit)


        // test withdrawal of liquidity
        alice_liq_balance = await hypervisor.balanceOf(alice.address)
        console.log("alice liq balance: " + alice_liq_balance)
        await hypervisor.connect(alice).withdraw(alice_liq_balance, alice.address, alice.address)
        resp = await hypervisor.getTotalAmounts()
        // verify that all liquidity has been removed from the pool
        expect(resp[0]).to.equal(0)
        expect(resp[1]).to.equal(0)
        console.log("totalAmounts after alice withdraws liq: " + resp)
    })

    it('fees', async () => {
        await hypervisorFactory.createHypervisor(token0.address, token1.address, FeeAmount.MEDIUM, -120, 120, 1200, 1800)
        const hypervisorAddress = await hypervisorFactory.getHypervisor(token0.address, token1.address, FeeAmount.MEDIUM)
        hypervisor = (await ethers.getContractAt('Hypervisor', hypervisorAddress)) as Hypervisor

        const poolAddress = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM)
        uniswapPool = (await ethers.getContractAt('IUniswapV3Pool', poolAddress)) as IUniswapV3Pool
        await uniswapPool.initialize(encodePriceSqrt('1', '1'))

        // adding extraliquidity into pool to make sure there's always
        // someone to swap with
        await token0.mint(carol.address, ethers.utils.parseEther('1000000000000'))
        await token1.mint(carol.address, ethers.utils.parseEther('1000000000000'))

        await token0.connect(carol).approve(nft.address, ethers.utils.parseEther('10000000000'))
        await token1.connect(carol).approve(nft.address, ethers.utils.parseEther('10000000000'))

        await nft.connect(carol).mint({
            token0: token0.address,
            token1: token1.address,
            tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
            tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
            fee: FeeAmount.MEDIUM,
            recipient: carol.address,
            amount0Desired: ethers.utils.parseEther('10000000000'),
            amount1Desired: ethers.utils.parseEther('10000000000'),
            amount0Min: 0,
            amount1Min: 0,
            deadline: 2000000000,
        })

        await token0.mint(alice.address, ethers.utils.parseEther('1000000'))
        await token1.mint(alice.address, ethers.utils.parseEther('1000000'))

        await token0.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))
        await token1.connect(alice).approve(hypervisor.address, ethers.utils.parseEther('1000000'))

        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('100'), ethers.utils.parseEther('100'), alice.address)
        await hypervisor.connect(alice).deposit(ethers.utils.parseEther('1000'), ethers.utils.parseEther('100'), alice.address)
        let resp = await hypervisor.getTotalAmounts()
        console.log("totalAmounts: " + resp)

        // do a test swap
        console.log("Carol swap a huge quantity of coins, which should significantly impact hypervisor holdings-----")
        await token0.connect(carol).approve(router.address, ethers.utils.parseEther('10000000000'))
        await token1.connect(carol).approve(router.address, ethers.utils.parseEther('10000000000'))
        await router.connect(carol).exactInputSingle({
            tokenIn: token0.address,
            tokenOut: token1.address,
            fee: FeeAmount.MEDIUM,
            recipient: carol.address,
            deadline: 2000000000, // Wed May 18 2033 03:33:20 GMT+0000
            amountIn: ethers.utils.parseEther('75000000'),
            amountOutMinimum: ethers.utils.parseEther('0'),
            sqrtPriceLimitX96: 0,
        })

        // check that the price as fully moved through the basePosition
        const { tick: currentTick } = await uniswapPool.slot0()
        expect(currentTick).to.be.lt(-120);

        let token0Liq = await token0.balanceOf(poolAddress)
        let token1Liq = await token1.balanceOf(poolAddress)
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        await router.connect(carol).exactInputSingle({
            tokenIn: token1.address,
            tokenOut: token0.address,
            fee: FeeAmount.MEDIUM,
            recipient: carol.address,
            deadline: 2000000000, // Wed May 18 2033 03:33:20 GMT+0000
            amountIn: ethers.utils.parseEther('75000000'),
            amountOutMinimum: ethers.utils.parseEther('0'),
            sqrtPriceLimitX96: 0,
        })
        token0Liq = await token0.balanceOf(poolAddress)
        token1Liq = await token1.balanceOf(poolAddress)
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())
        // TODO test rebalance
        console.log("owner balances before rebase (should be zero)")
        let fees0 = await token0.balanceOf(bob.address)
        let fees1 = await token1.balanceOf(bob.address)
        console.log("fees0: " + fees0.toString() + "\nfees1: " + fees1.toString())
        expect(fees0).to.equal(0)
        expect(fees1).to.equal(0)
        await hypervisor.rebalance(-120, 120, 0, 60, bob.address);
        console.log("owner balances after rebase (should be equal to 30 bips of deposit)")
        fees0 = await token0.balanceOf(bob.address)
        fees1 = await token1.balanceOf(bob.address)
        //expect(fees0).to.be.gt(0)
        //expect(fees1).to.be.gt(0)
        console.log("fees0: " + fees0.toString() + "\nfees1: " + fees1.toString())
    })

    it('fees test', async () => {
        await hypervisorFactory.createHypervisor(token0.address, token1.address, FeeAmount.MEDIUM, -120, 120, 200, 2000);
        const hypervisorAddress = await hypervisorFactory.getHypervisor(token0.address, token1.address, FeeAmount.MEDIUM);
        hypervisor = (await ethers.getContractAt('Hypervisor', hypervisorAddress)) as Hypervisor

        const poolAddress = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM);
        uniswapPool = (await ethers.getContractAt('IUniswapV3Pool', poolAddress)) as IUniswapV3Pool;
        await uniswapPool.initialize(encodePriceSqrt('1', '1'))

        // token mint for liquidity add

        await token0.mint(carol.address, ethers.utils.parseEther('100000000'));
        await token1.mint(carol.address, ethers.utils.parseEther('100000000'));

        await token0.mint(user0.address, ethers.utils.parseEther('10000'));
        await token1.mint(user0.address, ethers.utils.parseEther('10000'));

        await token0.mint(user1.address, ethers.utils.parseEther('10000'));
        await token1.mint(user1.address, ethers.utils.parseEther('10000'));

        await token0.mint(user2.address, ethers.utils.parseEther('10000'));
        await token1.mint(user2.address, ethers.utils.parseEther('10000'));

        await token0.mint(user3.address, ethers.utils.parseEther('10000'));
        await token1.mint(user3.address, ethers.utils.parseEther('10000'));

        await token0.mint(user4.address, ethers.utils.parseEther('10000'));
        await token1.mint(user4.address, ethers.utils.parseEther('10000'));

        await token0.mint(other.address, ethers.utils.parseEther('100000'));
        await token1.mint(other.address, ethers.utils.parseEther('100000'));

        // deposit to hypervisor contract

        await token0.connect(user0).approve(hypervisor.address, ethers.utils.parseEther('10000'));
        await token1.connect(user0).approve(hypervisor.address, ethers.utils.parseEther('10000'));

        await token0.connect(user1).approve(hypervisor.address, ethers.utils.parseEther('10000'));
        await token1.connect(user1).approve(hypervisor.address, ethers.utils.parseEther('10000'));

        await token0.connect(user2).approve(hypervisor.address, ethers.utils.parseEther('10000'));
        await token1.connect(user2).approve(hypervisor.address, ethers.utils.parseEther('10000'));

        await token0.connect(user3).approve(hypervisor.address, ethers.utils.parseEther('10000'));
        await token1.connect(user3).approve(hypervisor.address, ethers.utils.parseEther('10000'));

        await token0.connect(user4).approve(hypervisor.address, ethers.utils.parseEther('10000'));
        await token1.connect(user4).approve(hypervisor.address, ethers.utils.parseEther('10000'));

        await hypervisor.connect(user0).deposit(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000'), user0.address);
        await hypervisor.connect(user1).deposit(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000'), user1.address);
        await hypervisor.connect(user2).deposit(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000'), user2.address);
        await hypervisor.connect(user3).deposit(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000'), user3.address);
        await hypervisor.connect(user4).deposit(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000'), user4.address);

        let user0token0Amount = await token0.balanceOf(user0.address);
        let user0token1Amount = await token1.balanceOf(user0.address);

        let user1token0Amount = await token0.balanceOf(user1.address);
        let user1token1Amount = await token1.balanceOf(user1.address);

        let user2token0Amount = await token0.balanceOf(user2.address);
        let user2token1Amount = await token1.balanceOf(user2.address);

        let user3token0Amount = await token0.balanceOf(user3.address);
        let user3token1Amount = await token1.balanceOf(user3.address);

        let user4token0Amount = await token0.balanceOf(user4.address);
        let user4token1Amount = await token1.balanceOf(user4.address);

        expect(user0token0Amount.toString()).to.be.equal("0");
        expect(user1token0Amount.toString()).to.be.equal("0");
        expect(user2token0Amount.toString()).to.be.equal("0");
        expect(user3token0Amount.toString()).to.be.equal("0");
        expect(user4token0Amount.toString()).to.be.equal("0");
        expect(user0token1Amount.toString()).to.be.equal("0");
        expect(user1token1Amount.toString()).to.be.equal("0");
        expect(user2token1Amount.toString()).to.be.equal("0");
        expect(user3token1Amount.toString()).to.be.equal("0");
        expect(user4token1Amount.toString()).to.be.equal("0");
        // swap big amount
        await token0.connect(other).approve(router.address, ethers.utils.parseEther('500000'));
        await token1.connect(other).approve(router.address, ethers.utils.parseEther('500000'));

        let token0Liq = await token0.balanceOf(poolAddress)
        let token1Liq = await token1.balanceOf(poolAddress)

        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())

        await router.connect(other).exactInputSingle({
            tokenIn: token0.address,
            tokenOut: token1.address,
            fee: FeeAmount.MEDIUM,
            recipient: other.address,
            deadline: 2000000000,
            amountIn: ethers.utils.parseEther('50000'),
            amountOutMinimum: ethers.utils.parseEther('0'),
            sqrtPriceLimitX96: 0
        })        

        const { tick: currentTick } = await uniswapPool.slot0();
        expect(currentTick).to.be.lt(0);

        token0Liq = await token0.balanceOf(poolAddress)
        token1Liq = await token1.balanceOf(poolAddress)

        console.log('fee test')
        console.log("token0Liq: " + token0Liq.toString() + "\ntoken1Liq: " + token1Liq.toString())


        // rebalance

        await hypervisor.rebalance(-120, 120, 0, 60, bob.address);

        // withdraw

        const user0_liq_balance = await hypervisor.balanceOf(user0.address);
        const user1_liq_balance = await hypervisor.balanceOf(user1.address);
        const user2_liq_balance = await hypervisor.balanceOf(user2.address);
        const user3_liq_balance = await hypervisor.balanceOf(user3.address);
        const user4_liq_balance = await hypervisor.balanceOf(user4.address);

        await hypervisor.connect(user0).withdraw(user0_liq_balance, user0.address, user0.address);
        await hypervisor.connect(user1).withdraw(user1_liq_balance, user1.address, user1.address);
        await hypervisor.connect(user2).withdraw(user2_liq_balance, user2.address, user2.address);
        await hypervisor.connect(user3).withdraw(user3_liq_balance, user3.address, user3.address);
        await hypervisor.connect(user4).withdraw(user4_liq_balance, user4.address, user4.address);

        user0token0Amount = await token0.balanceOf(user0.address);
        user0token1Amount = await token1.balanceOf(user0.address);

        user1token0Amount = await token0.balanceOf(user1.address);
        user1token1Amount = await token1.balanceOf(user1.address);

        user2token0Amount = await token0.balanceOf(user2.address);
        user2token1Amount = await token1.balanceOf(user2.address);

        user3token0Amount = await token0.balanceOf(user3.address);
        user3token1Amount = await token1.balanceOf(user3.address);

        user4token0Amount = await token0.balanceOf(user4.address);
        user4token1Amount = await token1.balanceOf(user4.address);

        expect(user0token0Amount.toString()).to.be.equal(user1token0Amount.toString());
        expect(user1token0Amount.toString()).to.be.equal(user2token0Amount.toString());
        expect(user2token0Amount.toString()).to.be.equal(user3token0Amount.toString());
        expect(user3token0Amount.toString()).to.be.equal(user4token0Amount.toString());
        expect(user0token1Amount.toString()).to.be.equal(user1token1Amount.toString());
        expect(user1token1Amount.toString()).to.be.equal(user2token1Amount.toString());
        expect(user2token1Amount.toString()).to.be.equal(user3token1Amount.toString());
        expect(user3token1Amount.toString()).to.be.equal(user4token1Amount.toString());

    })
})
