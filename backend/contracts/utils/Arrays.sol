// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

library Arrays {
    function find(uint value, uint[] memory arr) internal pure returns (uint) {
        uint i = 0;
        while (arr[i] != value) {
            i++;
        }
        return i;
    }

    // don't forget to reduce array length after function call
    function removeByValue(uint value, uint[] storage arr) internal {
        uint i = find(value, arr);
        removeByIndex(i, arr);
    }

    // don't forget to reduce array length after function call
    function removeByIndex(uint i, uint[] storage arr) internal {
        while (i < arr.length - 1) {
            arr[i] = arr[i + 1];
            i++;
        }
    }
}
