import { expect } from 'chai'
import { constants, Wallet } from 'ethers'
import { formatEther, parseEther} from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { deployContract, signPermission } from './utils'
import {
    FeeAmount,
    TICK_SPACINGS,
    encodePriceSqrt,
    getPositionKey,
    getMinTick,
    getMaxTick
} from './shared/utilities'


const DAY = 60 * 60 * 24

task('deploy-hypervisor-factory', 'Deploy Hypervisor contract')
  .setAction(async (cliArgs, { ethers, run, network }) => {
    
    //TODO cli args
    // goerli
    const args = {
      uniswapFactory: "0x288be1A33bcdfA9A09cCa95CA1eD628A5294e82c",  
    };


    console.log('Network')
    console.log('  ', network.name)
    console.log('Task Args')
    console.log(args)

    // compile

    await run('compile')

    // get signer

    const signer = (await ethers.getSigners())[0]
    console.log('Signer')
    console.log('  at', signer.address)
    console.log('  ETH', formatEther(await signer.getBalance()))

    // deploy contracts

    const hypervisorFactoryFactory = await ethers.getContractFactory('HypervisorFactory')

    const hypervisorFactory = await deployContract(
      'HypervisorFactory',
      await ethers.getContractFactory('HypervisorFactory'),
      signer,
      [args]
    )

    await hypervisorFactory.deployTransaction.wait(5)
    await run('verify:verify', {
      address: hypervisorFactory.address,
      constructorArguments: [args.uniswapFactory],
    })
})

task('verify-factory', 'Deploy Hypervisor contract')
  .setAction(async (cliArgs, { ethers, run, network }) => {

    // TODO cli args
    // goerli
    const args = {
      uniswapFactory: "0x921156a405461EaE7df9c40D56304258CdDE7016",  
      factory: "0x921156a405461EaE7df9c40D56304258CdDE7016",  
      token0: "0xFfEc41C97e070Ab5EBeB6E24258B38f69EED5020", 
      token1: "0x1F3BeD559565b56dAabed5790af29ffEd628c4B6",
      fee: FeeAmount.MEDIUM,
      baseLower: -1800, 
      baseUpper: 1800, 
      limitLower: -600, 
      limitUpper: 0
    };

    console.log('Network')
    console.log('  ', network.name)
    console.log('Task Args')
    console.log(args)

    // compile

    await run('compile')

    // get signer

    const signer = (await ethers.getSigners())[0]
    console.log('Signer')
    console.log('  at', signer.address)
    console.log('  ETH', formatEther(await signer.getBalance()))

    const hypervisorFactory = await ethers.getContractAt(
      'HypervisorFactory',
      args.factory,
      signer,
    )

    // await hypervisor.deployTransaction.wait(5)
    await run('verify:verify', {
      address: hypervisorFactory.address,
      constructorArguments: [args.uniswapFactory],
    })

  });

task('deploy-hypervisor', 'Deploy Hypervisor contract')
  .setAction(async (cliArgs, { ethers, run, network }) => {

    // TODO cli args
    // goerli
    const args = {
      factory: "0x921156a405461EaE7df9c40D56304258CdDE7016",  
      token0: "0xFfEc41C97e070Ab5EBeB6E24258B38f69EED5020", 
      token1: "0x1F3BeD559565b56dAabed5790af29ffEd628c4B6",
      fee: FeeAmount.MEDIUM,
      baseLower: -1800, 
      baseUpper: 1800, 
      limitLower: -600, 
      limitUpper: 0
    };

    console.log('Network')
    console.log('  ', network.name)
    console.log('Task Args')
    console.log(args)

    // compile

    await run('compile')

    // get signer

    const signer = (await ethers.getSigners())[0]
    console.log('Signer')
    console.log('  at', signer.address)
    console.log('  ETH', formatEther(await signer.getBalance()))

    const hypervisorFactory = await ethers.getContractAt(
      'HypervisorFactory',
      args.factory,
      signer,
    )

    const hypervisor = await hypervisorFactory.createHypervisor(
      args.token0, args.token1, args.fee, 
      args.baseLower, args.baseUpper, args.limitLower, args.limitUpper 
    )

    // verify

      console.log('Verifying source on etherscan')

      await hypervisor.deployTransaction.wait(5)

      await run('verify:verify', {
        address: hypervisor.address,
      })

    const poolAddress = await hypervisor.getPool(args.token0, args.token1, args.fee)
    console.log(poolAddress);

}); 
