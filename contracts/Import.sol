pragma solidity ^0.4.24;

import '@gnosis.pm/pm-contracts/contracts/Oracles/CentralizedOracle.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/CentralizedOracleFactory.sol';

import '@aragon/os/contracts/acl/ACL.sol';
import '@aragon/os/contracts/apm/APMRegistry.sol';
import '@aragon/os/contracts/factory/DAOFactory.sol';
import '@aragon/os/contracts/factory/EVMScriptRegistryFactory.sol';
import '@aragon/os/contracts/kernel/Kernel.sol';
import '@aragon/os/contracts/lib/ens/ENS.sol';
import '@aragon/os/contracts/lib/ens/PublicResolver.sol';
