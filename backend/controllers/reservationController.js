const Reservation = require("../models/Reservation");

exports.getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservation.getAll();
		res.status(200).json(reservations);
	} catch (error) {
		res.status(500).json({
			message: "Błąd podczas pobierania rezerwacji",
			error: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};

// exports.getReservationById = async (req, res) => {
// 	try {
// 		const reservationId = req.params.id;
// 		const reservation = await Reservation.getById(reservationId);

// 		if (!reservation) {
// 			return res.status(404).json({
// 				message: "Rezerwacja o podanym ID nie istnieje",
// 				details: `Szukane ID: ${reservationId}`,
// 			});
// 		}

// 		res.status(200).json(reservation);
// 	} catch (error) {
// 		console.error("Błąd w getReservationById:", error);
// 		res.status(500).json({
// 			message: "Błąd serwera podczas pobierania rezerwacji",
// 			error: process.env.NODE_ENV === "development" ? error.message : undefined,
// 		});
// 	}
// };

exports.getReservationById = async (req, res) => {
	try {
	  const reservationId = req.params.id;
	  console.log(`Szukam rezerwacji o ID: ${reservationId}`);
	  
	  const reservation = await Reservation.getById(reservationId);
	  console.log('Wynik zapytania:', reservation);
  
	  if (!reservation) {
		console.log(`Nie znaleziono rezerwacji o ID: ${reservationId}`);
		return res.status(404).json({
		  message: "Rezerwacja o podanym ID nie istnieje",
		  details: `Szukane ID: ${reservationId}`,
		});
	  }
  
	  res.status(200).json(reservation);
	} catch (error) {
	  console.error("Błąd w getReservationById:", error);
	  res.status(500).json({
		message: "Błąd serwera podczas pobierania rezerwacji",
		error: error.message,
		stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
	  });
	}
  };

exports.createReservation = async (req, res) => {
	try {
		const { imie, nazwisko, email, telefon, termin_odbioru, produkty } =
			req.body;

		if (
			!imie ||
			!nazwisko ||
			!email ||
			!telefon ||
			!termin_odbioru ||
			!produkty?.length
		) {
			return res.status(400).json({ message: "Brak wymaganych pól" });
		}

		const reservationId = await Reservation.create({
			imie,
			nazwisko,
			email,
			telefon,
			termin_odbioru,
			produkty,
		});

		res.status(201).json({
			message: "Rezerwacja utworzona pomyślnie",
			reservationId,
		});
	} catch (error) {
		console.error("Błąd w createReservation:", error);
		res.status(500).json({ message: "Błąd podczas tworzenia rezerwacji" });
	}
};

exports.updateReservationStatus = async (req, res) => {
	try {
		// Tylko dla administratora
		const adminPassword = req.headers["admin-key"];
		if (adminPassword !== process.env.ADMIN_KEY) {
			return res
				.status(403)
				.json({ message: "Brak uprawnień do wykonania tej operacji" });
		}

		const reservationId = req.params.id;
		const { status } = req.body;

		if (!status) {
			return res.status(400).json({ message: "Wymagane pole: status" });
		}

		// Sprawdź, czy status jest prawidłowy
		const validStatuses = [
			"nowa",
			"zatwierdzona",
			"gotowa do odbioru",
			"zrealizowana",
			"anulowana",
		];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({
				message: `Status musi być jednym z: ${validStatuses.join(", ")}`,
			});
		}

		// Sprawdź, czy rezerwacja istnieje
		const reservation = await Reservation.getById(reservationId);

		if (!reservation) {
			return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
		}

		const success = await Reservation.updateStatus(reservationId, status);

		if (success) {
			res
				.status(200)
				.json({ message: "Status rezerwacji został zaktualizowany pomyślnie" });
		} else {
			res
				.status(500)
				.json({ message: "Nie udało się zaktualizować statusu rezerwacji" });
		}
	} catch (error) {
		res.status(500).json({
			message: "Błąd podczas aktualizacji statusu rezerwacji",
			error: error.message,
		});
	}
};

exports.deleteReservation = async (req, res) => {
	try {
		// Tylko dla administratora
		const adminPassword = req.headers["admin-key"];
		if (adminPassword !== process.env.ADMIN_KEY) {
			return res
				.status(403)
				.json({ message: "Brak uprawnień do wykonania tej operacji" });
		}

		const reservationId = req.params.id;

		// Sprawdź, czy rezerwacja istnieje
		const reservation = await Reservation.getById(reservationId);

		if (!reservation) {
			return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
		}

		const success = await Reservation.delete(reservationId);

		if (success) {
			res
				.status(200)
				.json({ message: "Rezerwacja została usunięta pomyślnie" });
		} else {
			res.status(500).json({ message: "Nie udało się usunąć rezerwacji" });
		}
	} catch (error) {
		res.status(500).json({
			message: "Błąd podczas usuwania rezerwacji",
			error: error.message,
		});
	}
};
