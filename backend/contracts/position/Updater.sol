// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "hardhat/console.sol";

abstract contract Updater is AutomationCompatibleInterface {
    uint public immutable interval;
    uint public lastTimeStamp;

    event UpkeepPerformed(uint indexed tokenId);
    event UpdateStarted();

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory performData) {
        uint[] memory LPs = getTickOutOfRangePositions();
        upkeepNeeded = ((block.timestamp - lastTimeStamp) > interval) && (LPs.length > 0);
        performData = abi.encode(LPs);
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    }

    function performUpkeep(bytes calldata performData) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        (bool upkeepNeeded, bytes memory data) = checkUpkeep(performData);
        require(upkeepNeeded, "Upkeep not needed");
        emit UpdateStarted();
        uint[] memory tokens = abi.decode(data, (uint[]));
        console.log("Updating %s tokens", tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            console.log("Next position for update: %s", tokens[i]);
            updatePosition(tokens[i]);
        }
        lastTimeStamp = block.timestamp;
        emit UpkeepPerformed(tokens[0]);
    }

    function getTickOutOfRangePositions() public view virtual returns (uint[] memory);

    function updatePosition(uint tokenId) public virtual;
}
