const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
	try {
		const products = await Product.getAll();
		res.status(200).json(products);
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas pobierania produktów",
				error: error.message,
			});
	}
};

exports.getProductById = async (req, res) => {
	try {
		const product = await Product.getById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Produkt nie znaleziony" });
		}
		res.status(200).json(product);
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas pobierania produktu",
				error: error.message,
			});
	}
};

exports.createProduct = async (req, res) => {
	try {
		// Tylko dla administratora
		const adminPassword = req.headers["admin-key"];
		if (adminPassword !== process.env.ADMIN_KEY) {
			return res
				.status(403)
				.json({ message: "Brak uprawnień do wykonania tej operacji" });
		}

		// Walidacja danych wejściowych
		const {
			nazwa,
			opis,
			kategoriaid,
			cena,
			stanmagazynowy,
			statusdostepnosci,
		} = req.body;

		if (!nazwa || !kategoriaid || !cena) {
			return res
				.status(400)
				.json({ message: "Wymagane pola: nazwa, kategoriaid, cena" });
		}

		const productData = {
			nazwa,
			opis: opis || "",
			kategoriaid,
			cena,
			stanmagazynowy: stanmagazynowy || 0,
			statusdostepnosci: statusdostepnosci || "dostępny",
		};

		const productId = await Product.create(productData);
		res.status(201).json({
			message: "Produkt został utworzony pomyślnie",
			productId,
		});
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas tworzenia produktu",
				error: error.message,
			});
	}
};

exports.updateProduct = async (req, res) => {
	try {
		// Tylko dla administratora
		const adminPassword = req.headers["admin-key"];
		if (adminPassword !== process.env.ADMIN_KEY) {
			return res
				.status(403)
				.json({ message: "Brak uprawnień do wykonania tej operacji" });
		}

		const productId = req.params.id;
		const product = await Product.getById(productId);

		if (!product) {
			return res.status(404).json({ message: "Produkt nie znaleziony" });
		}

		// Walidacja danych wejściowych
		const {
			nazwa,
			opis,
			kategoriaid,
			cena,
			stanmagazynowy,
			statusdostepnosci,
		} = req.body;

		if (!nazwa || !kategoriaid || !cena) {
			return res
				.status(400)
				.json({ message: "Wymagane pola: nazwa, kategoriaid, cena" });
		}

		const productData = {
			nazwa,
			opis: opis || product.opis,
			kategoriaid,
			cena,
			stanmagazynowy:
				stanmagazynowy !== undefined ? stanmagazynowy : product.stanmagazynowy,
			statusdostepnosci: statusdostepnosci || product.statusdostepnosci,
		};

		const success = await Product.update(productId, productData);

		if (success) {
			res
				.status(200)
				.json({ message: "Produkt został zaktualizowany pomyślnie" });
		} else {
			res.status(500).json({ message: "Nie udało się zaktualizować produktu" });
		}
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas aktualizacji produktu",
				error: error.message,
			});
	}
};

exports.deleteProduct = async (req, res) => {
	try {
		// Tylko dla administratora
		const adminPassword = req.headers["admin-key"];
		if (adminPassword !== process.env.ADMIN_KEY) {
			return res
				.status(403)
				.json({ message: "Brak uprawnień do wykonania tej operacji" });
		}

		const productId = req.params.id;
		const product = await Product.getById(productId);

		if (!product) {
			return res.status(404).json({ message: "Produkt nie znaleziony" });
		}

		try {
			const success = await Product.delete(productId);

			if (success) {
				res.status(200).json({ message: "Produkt został usunięty pomyślnie" });
			} else {
				res.status(500).json({ message: "Nie udało się usunąć produktu" });
			}
		} catch (error) {
			if (error.message.includes("powiązany z rezerwacjami")) {
				return res.status(400).json({ message: error.message });
			}
			throw error;
		}
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas usuwania produktu",
				error: error.message,
			});
	}
};

exports.getProductsByCategory = async (req, res) => {
	try {
		const categoryId = req.params.categoryId;
		const products = await Product.getByCategory(categoryId);
		res.status(200).json(products);
	} catch (error) {
		res
			.status(500)
			.json({
				message: "Błąd podczas pobierania produktów z kategorii",
				error: error.message,
			});
	}
};
