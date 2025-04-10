const sql = require("mssql");

class Category {
	static async getAll() {
		try {
			const result = await sql.query`SELECT * FROM Kategoria`;
			return result.recordset;
		} catch (error) {
			throw error;
		}
	}

	static async getById(id) {
		try {
			const result =
				await sql.query`SELECT * FROM Kategoria WHERE kategoriaid = ${id}`;
			return result.recordset[0];
		} catch (error) {
			throw error;
		}
	}

	static async create(categoryData) {
		try {
			const { nazwa, opis } = categoryData;
			const result = await sql.query`
        INSERT INTO Kategoria (nazwa, opis)
        VALUES (${nazwa}, ${opis})
        SELECT SCOPE_IDENTITY() AS kategoriaid
      `;
			return result.recordset[0].kategoriaid;
		} catch (error) {
			throw error;
		}
	}

	static async update(id, categoryData) {
		try {
			const { nazwa, opis } = categoryData;
			const result = await sql.query`
        UPDATE Kategoria
        SET nazwa = ${nazwa},
            opis = ${opis}
        WHERE kategoriaid = ${id}
      `;
			return result.rowsAffected[0] > 0;
		} catch (error) {
			throw error;
		}
	}

	static async delete(id) {
		try {
			// Sprawdzamy, czy kategoria nie jest powiązana z produktami
			const checkProducts = await sql.query`
        SELECT COUNT(*) AS count FROM Products WHERE kategoriaid = ${id}
      `;

			if (checkProducts.recordset[0].count > 0) {
				throw new Error(
					"Nie można usunąć kategorii, która jest powiązana z produktami"
				);
			}

			const result =
				await sql.query`DELETE FROM Kategoria WHERE kategoriaid = ${id}`;
			return result.rowsAffected[0] > 0;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Category;
