const routerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
const factoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const addressRegExp = new RegExp('^0x[a-fA-F0-9]{40}$')

module.exports = {
    routerAddress,
    factoryAddress,
    ZERO_ADDRESS,
    addressRegExp
}