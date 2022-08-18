const routerAddresses = {
    31337: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    42: "0x3756e05A1982E652A337C29aE178680e53D38B1a"
}

const factoryAddresses = {
    31337: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    42: "0x8C6ed9420d8917D02B9e0C0498cC91c0b370F7bC"
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const addressRegExp = new RegExp('^0x[a-fA-F0-9]{40}$')

module.exports = {
    routerAddresses,
    factoryAddresses,
    ZERO_ADDRESS,
    addressRegExp
}