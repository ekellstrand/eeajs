const Web3 = require('web3');
const EEAClient = require('../src');
const HumandStandartTokenJson = require('./solidity/HumanStandardToken/HumanStandardToken.json');
const Buffer = require('safe-buffer').Buffer;
const ethUtil = require('../src/custom-ethjs-util');

const web3 = new EEAClient(new Web3('http://localhost:20000'), 2018);

const contract = web3.eth.Contract(HumandStandartTokenJson.abi); // pass by reference monkey patch

// create HumanStandardToken constructor
const constructorAbi = HumandStandartTokenJson.abi.find(function (element) {
    return element.type === 'constructor'
});
const constructorArgs = web3.eth.abi.encodeParameters(constructorAbi.inputs, [1000000, "DrumG Technologies Token", 10, "DrumG"]).slice(2);

const contractOptions = {
    data: '0x' + HumandStandartTokenJson.binary + constructorArgs,
    privateFrom: 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
    privateFor: ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
    privateKey: '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
};

web3.eea.sendRawTransaction(contractOptions).then(res => {
    console.log("Transaction Hash " + res.data.result);
    return web3.eea.getTransactionReceipt(res.data.result, 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=')
}).then(privateTransactionReceipt => {
    console.log("Private Transaction Receipt");
    console.log(privateTransactionReceipt.data);
    return privateTransactionReceipt.data.result.contractAddress
}).then(contractAddress => {
    // can we do a web3.eea.Contract? somehow need to override to use the eea.sendRawTransaction when invoking contract methods
    // const contract = web3.eth.Contract(HumandStandartTokenJson.abi, contractAddress);
    // contract.methods.transfer(["to", "value"]).send(??)

    // already 0x prefixed
    const functionAbi = HumandStandartTokenJson.abi.find(function (element) {
        return element.name === 'transfer'
    });
    const transferTo = '0x' + ethUtil.privateToAddress(new Buffer('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex')).toString('hex');
    const functionArgs = web3.eth.abi.encodeParameters(functionAbi.inputs, [transferTo, 1]).slice(2);

    return web3.eea.sendRawTransaction({
        to: contractAddress,
        data: functionAbi.signature + functionArgs,
        privateFrom: 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
        privateFor: ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
        privateKey: '8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
    })
}).then(res => {
    console.log("Transaction Hash " + res.data.result);
    return web3.eea.getTransactionReceipt(res.data.result, 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=')
}).then(privateTransactionReceipt => {
    console.log("Private Transaction Receipt");
    console.log(privateTransactionReceipt.data.result);
    if (privateTransactionReceipt.data.result.logs.length > 0) {
        console.log("Log 0");
        console.log(privateTransactionReceipt.data.result.logs[0])
    }
    return privateTransactionReceipt.data.result.contractAddress
});