// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
 
contract Whitelist {
    struct Person {
        string name;
        uint age;
    }

    mapping(address => bool) whitelist;

    
}