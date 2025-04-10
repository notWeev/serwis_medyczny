const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Publiczne endpointy
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getCategoryProducts);

// Endpointy dla administratorów (zabezpieczone kluczem admin)
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
