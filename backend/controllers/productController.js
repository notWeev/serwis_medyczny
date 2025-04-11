const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania produktów', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    res.status(201).json({ message: 'Produkt został utworzony', id: productId });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas tworzenia produktu', error: error.message });
  }
};
