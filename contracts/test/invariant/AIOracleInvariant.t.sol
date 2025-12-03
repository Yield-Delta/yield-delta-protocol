// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "./handlers/AIOracleHandler.sol";
import "../../src/AIOracle.sol";
import "../../src/StrategyVault.sol";

contract AIOracleInvariantTest is InvariantBase {
    AIOracle public oracle;
    StrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    AIOracleHandler public handler;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);
        vm.startPrank(owner);
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");
        oracle = new AIOracle(owner);
        vault = new StrategyVault("Test", "tVLT", address(token0), address(token1), 3000, address(oracle), owner);
        vm.stopPrank();
        token0.mint(address(vault), 100_000 * 1e18);
        token1.mint(address(vault), 100_000 * 1e18);
        handler = new AIOracleHandler(oracle, vault);
        targetContract(address(handler));
        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = AIOracleHandler.registerModel.selector;
        selectors[1] = AIOracleHandler.submitRequest.selector;
        selectors[2] = AIOracleHandler.executeRequest.selector;
        selectors[3] = AIOracleHandler.deactivateModel.selector;
        selectors[4] = AIOracleHandler.warpTime.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function invariant_noDoubleExecution() public view {
        assert(handler.ghost_requestsExecuted() <= handler.getSubmittedRequestCount());
    }

    function invariant_requestCountConsistent() public view {
        assert(oracle.totalRequests() == handler.ghost_requestsSubmitted());
    }

    function invariant_oracleStateConsistent() public view {
        assert(oracle.totalRequests() >= oracle.successfulRequests());
    }

    function invariant_callSummary() public view {
        (uint256 r, uint256 s, uint256 e, uint256 f,,) = handler.callSummary();
        console.log("Requests:", r);
        console.log("Successful:", s);
        console.log("Executed:", e);
        console.log("Failed:", f);
    }
}

contract AIOracleStatelessFuzzTest is InvariantBase {
    using ECDSA for bytes32;
    AIOracle public oracle;
    StrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    uint256 internal signerPrivateKey = 0xA11CE;
    address internal signer;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);
        signer = vm.addr(signerPrivateKey);
        vm.startPrank(owner);
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");
        oracle = new AIOracle(owner);
        vault = new StrategyVault("Test", "tVLT", address(token0), address(token1), 3000, address(oracle), owner);
        oracle.registerAIModel("test_model", signer);
        vm.stopPrank();
        token0.mint(address(vault), 100_000 * 1e18);
        token1.mint(address(vault), 100_000 * 1e18);
    }

    function _sign(int24 tL, int24 tU, uint256 c, uint256 d) internal returns (bytes memory) {
        bytes32 h = keccak256(abi.encodePacked(address(vault), tL, tU, c, d)).toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, h);
        return abi.encodePacked(r, s, v);
    }

    function testFuzz_SubmitRequest(int24 tL, int24 tU, uint256 c) public {
        tL = int24(bound(int256(tL), -887272, 887270));
        tU = int24(bound(int256(tU), int256(tL) + 1, 887272));
        c = bound(c, 1, 10000);
        uint256 d = block.timestamp + 1 hours;
        bytes memory sig = _sign(tL, tU, c, d);
        uint256 pre = oracle.totalRequests();
        bytes32 rid = oracle.submitRebalanceRequest(address(vault), tL, tU, c, d, "test_model", sig);
        assertEq(oracle.totalRequests(), pre + 1);
        (address rv,,,,,, bool ex) = oracle.requests(rid);
        assertEq(rv, address(vault));
        assertFalse(ex);
    }

    function testFuzz_InvalidConfidence(uint256 c) public {
        c = bound(c, 10001, type(uint256).max);
        bytes memory sig = _sign(-100, 100, c, block.timestamp + 1 hours);
        vm.expectRevert("Invalid confidence");
        oracle.submitRebalanceRequest(address(vault), -100, 100, c, block.timestamp + 1 hours, "test_model", sig);
    }

    function testFuzz_NoDoubleExecution(uint256 n) public {
        n = bound(n, 2, 10);
        uint256 d = block.timestamp + 1 hours;
        bytes memory sig = _sign(-100, 100, 5000, d);
        bytes32 rid = oracle.submitRebalanceRequest(address(vault), -100, 100, 5000, d, "test_model", sig);
        oracle.executeRebalanceRequest(rid, "test_model");
        for (uint256 i = 1; i < n; i++) {
            vm.expectRevert("Already executed");
            oracle.executeRebalanceRequest(rid, "test_model");
        }
    }
}
