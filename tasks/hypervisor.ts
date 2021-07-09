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
      uniswapFactory: "0x1f98431c8ad98523631ae4a59f267346ea31f984",
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
      [args.uniswapFactory]
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
      uniswapFactory: "0x1f98431c8ad98523631ae4a59f267346ea31f984",  
      factory: "0x67C11b788448C149eB08839Af6025Fe6dc80CFbC",  
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
      factory: "0x67C11b788448C149eB08839Af6025Fe6dc80CFbC",  
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

task('verify-hypervisor', 'Deploy Hypervisor contract')
  .setAction(async (cliArgs, { ethers, run, network }) => {

    const hypervisorAddress = "0xfb7260e2faE6EF1A33E4Fd5C69E71291C48cA9c7";
    // TODO cli args
    // goerli
    const args = {
      pool: "0xba9D3f004F7fb378260525cf26F701853CE244eD",
      owner: signer.address,
      baseLower: -1800, 
      baseUpper: 1800, 
      limitLower: -600, 
      limitUpper: 0
    };

    console.log('Network')
    console.log('  ', network.name)
    console.log('Task Args')
    console.log(args)
console.log(Object.values(args));

    await run('compile')

    // get signer

    const signer = (await ethers.getSigners())[0]
    console.log('Signer')
    console.log('  at', signer.address)
    console.log('  ETH', formatEther(await signer.getBalance()))

    const hypervisor = await ethers.getContractAt(
      'Hypervisor',
      hypervisorAddress,
      signer,
    )

    // await hypervisor.deployTransaction.wait(5)
    await run('verify:verify', {
      address: hypervisor.address,
      constructorArguments: Object.values(args),
    })

  });


