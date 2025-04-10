const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania kategorii', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Kategoria nie znaleziona' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania kategorii', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    // Walidacja danych wejściowych
    const { nazwa, opis } = req.body;
    
    if (!nazwa) {
      return res.status(400).json({ message: 'Wymagane pole: nazwa' });
    }
    
    const categoryData = {
      nazwa,
      opis: opis || ''
    };
    
    const categoryId = await Category.create(categoryData);
    res.status(201).json({ 
      message: 'Kategoria została utworzona pomyślnie', 
      categoryId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas tworzenia kategorii', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const categoryId = req.params.id;
    const category = await Category.getById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Kategoria nie znaleziona' });
    }
    
    // Walidacja danych wejściowych
    const { nazwa, opis } = req.body;
    
    if (!nazwa) {
      return res.status(400).json({ message: 'Wymagane pole: nazwa' });
    }
    
    const categoryData = {
      nazwa,
      opis: opis || category.opis
    };
    
    const success = await Category.update(categoryId, categoryData);
    
    if (success) {
      res.status(200).json({ message: 'Kategoria została zaktualizowana pomyślnie' });
    } else {
      res.status(500).json({ message: 'Nie udało się zaktualizować kategorii' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji kategorii', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const categoryId = req.params.id;
    const category = await Category.getById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Kategoria nie znaleziona' });
    }
    
    try {
      const success = await Category.delete(categoryId);
      
      if (success) {
        res.status(200).json({ message: 'Kategoria została usunięta pomyślnie' });
      } else {
        res.status(500).json({ message: 'Nie udało się usunąć kategorii' });
      }
    } catch (error) {
      if (error.message.includes('powiązana z produktami')) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania kategorii', error: error.message });
  }
};

exports.getCategoryProducts = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Sprawdź, czy kategoria istnieje
    const category = await Category.getById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Kategoria nie znaleziona' });
    }
    
    const products = await Product.getByCategory(categoryId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania produktów z kategorii', error: error.message });
  }
};
