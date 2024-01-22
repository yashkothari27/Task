const mongoose = require('mongoose');

const myTokenSchema = new mongoose.Schema({
  address: String,
  balance: Number,
});

const productStoreSchema = new mongoose.Schema({
  productId: Number,
  price: Number,
  owner: String,
});

const MyToken = mongoose.model('MyToken', myTokenSchema);
const ProductStore = mongoose.model('ProductStore', productStoreSchema);

module.exports = {
  MyToken,
  ProductStore,
};
