const Web3 = require('web3');
require('dotenv').config();
const API_KEY = 'a7b9c9f4c4b344ec97ec79f521fc1ccc';
const provider = `https://polygon-mumbai.infura.io/v3/${API_KEY}`;
const web3 = new Web3(provider);

const PRIVATE_KEY = "8cca908ac4a08eccd6f5a79158b8f98c6b592c369ec8cf5bedd3af4ae7010d82";

const { myTokenAbi, productStoreAbi } = require('./Abi');

const myTokenAddress = '0xb18863d4dEb921abfA5F3d7fcb0E618eDCdc420f';
const productStoreAddress = '0x56a15F83B54d8e0dFE61EA3bAe98bef539F8F4F6';

const myTokenContract = new web3.eth.Contract(myTokenAbi, myTokenAddress);
const productStoreContract = new web3.eth.Contract(productStoreAbi, productStoreAddress);

const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

// Mint Tokens
const mintTokens = async (req, res) => {
  try {
    const { address, balance } = req.body;

    await myTokenContract.methods.mint(address, balance).send({ from: account.address });

    res.json({ success: true, message: 'Tokens minted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to mint tokens' });
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const address = req.query;

    const balance = await myTokenContract.methods.balanceOf(address).call();

    res.json({ balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get token balance' });
  }
};

const setProductPrice = async (req, res) => {
  try {
    const { price, owner } = req.body;

    await productStoreContract.methods.changeProdPrice(price).send({ from: owner });

    res.json({ success: true, message: 'Product price set successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to set product price' });
  }
};

const buyProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    const transactionData = await productStoreContract.methods.buyProduct(productId).encodeABI();
    const estimatedGas = await productStoreContract.methods.buyProduct(productId).estimateGas({ from: account.address });

    const transaction = {
      from: account.address,
      gas: estimatedGas,
      data: transactionData,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, PRIVATE_KEY);
    const transactionHash = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    console.log("Transaction Hash:", transactionHash);

    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    if (receipt.status === 1) {
      console.log("Transaction successful!");
      res.json({ success: true, message: 'Product bought successfully', transactionHash });
    } else {
      console.error("Transaction failed:", receipt.gasUsed);
      res.status(500).json({ success: false, message: 'Failed to buy product', transactionHash });
    }

  } catch (error) {
    console.error("Error buying product:", error.message);

    if (error.message.includes("Insufficient balance")) {
      res.status(400).json({
        success: false,
        message: "Insufficient token balance to purchase product",
        transactionHash,
      });
    } else if (error.message.includes("Product unavailable")) {
      res.status(404).json({
        success: false,
        message: "Product is unavailable or already purchased",
        transactionHash,
      });
    } else if (error.message.includes("Incorrect price")) {
      res.status(400).json({
        success: false,
        message: "Provided price does not match expected value",
        transactionHash,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        transactionHash,
      });
    }
    
  }
}