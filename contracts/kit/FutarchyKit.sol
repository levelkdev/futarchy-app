pragma solidity 0.4.24;

import "../StubFutarchyApp.sol";

import "@aragon/os/contracts/apm/APMNamehash.sol";
import "@aragon/os/contracts/common/IsContract.sol";

import "@aragon/kits-base/contracts/KitBase.sol";


contract FutarchyKit is KitBase, APMNamehash, IsContract {

    bytes32 constant public futarchyAppId = apmNamehash("stub-futarchy-app");

    constructor(DAOFactory _fac, ENS _ens) KitBase(_fac, _ens) public {
        require(isContract(address(_fac.regFactory())));
    }

    function newInstance(address authorizedAddress) external returns (Kernel) {
        Kernel dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());

        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        StubFutarchyApp futarchyApp = StubFutarchyApp(dao.newAppInstance(futarchyAppId, latestVersionAppBase(futarchyAppId)));
        emit InstalledApp(futarchyApp, futarchyAppId);

        // permissions
        acl.createPermission(authorizedAddress, futarchyApp, futarchyApp.CREATE_DECISIONS_ROLE(), msg.sender);

        // App inits
        futarchyApp.initialize();

        emit DeployInstance(dao);

        return dao;
    }
}