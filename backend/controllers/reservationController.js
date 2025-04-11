const Reservation = require('../models/Reservation');

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getAll();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ 
      message: 'Błąd podczas pobierania rezerwacji',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


exports.getReservationById = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const reservationId = req.params.id;
    const reservation = await Reservation.getById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezerwacja nie znaleziona' });
    }
    
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania rezerwacji', error: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    // Walidacja danych wejściowych
    const { imie, nazwisko, email, telefon, dataodbioruprefereowana, uwagi, pozycje } = req.body;
    
    if (!imie || !nazwisko || !email || !telefon || !pozycje || !Array.isArray(pozycje) || pozycje.length === 0) {
      return res.status(400).json({ 
        message: 'Wymagane pola: imie, nazwisko, email, telefon, pozycje (jako niepusta tablica)' 
      });
    }
    
    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Niepoprawny format adresu email' });
    }
    
    // Sprawdź, czy każda pozycja ma wymagane pola
    for (const item of pozycje) {
      if (!item.produktid || !item.ilosc || item.ilosc <= 0) {
        return res.status(400).json({ 
          message: 'Każda pozycja musi zawierać produktid i ilosc większą od 0' 
        });
      }
    }
    
    const reservationData = {
      imie,
      nazwisko,
      email,
      telefon,
      dataodbioruprefereowana: dataodbioruprefereowana || null,
      uwagi: uwagi || '',
      pozycje
    };
    
    try {
      const reservationId = await Reservation.create(reservationData);
      res.status(201).json({ 
        message: 'Rezerwacja została utworzona pomyślnie', 
        reservationId 
      });
    } catch (error) {
      if (error.message.includes('Niewystarczająca ilość produktu') || 
          error.message.includes('nie istnieje')) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas tworzenia rezerwacji', error: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const reservationId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Wymagane pole: status' });
    }
    
    // Sprawdź, czy status jest prawidłowy
    const validStatuses = ['nowa', 'zatwierdzona', 'gotowa do odbioru', 'zrealizowana', 'anulowana'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Status musi być jednym z: ${validStatuses.join(', ')}` 
      });
    }
    
    // Sprawdź, czy rezerwacja istnieje
    const reservation = await Reservation.getById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezerwacja nie znaleziona' });
    }
    
    const success = await Reservation.updateStatus(reservationId, status);
    
    if (success) {
      res.status(200).json({ message: 'Status rezerwacji został zaktualizowany pomyślnie' });
    } else {
      res.status(500).json({ message: 'Nie udało się zaktualizować statusu rezerwacji' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji statusu rezerwacji', error: error.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    // Tylko dla administratora
    const adminPassword = req.headers['admin-key'];
    if (adminPassword !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
    }
    
    const reservationId = req.params.id;
    
    // Sprawdź, czy rezerwacja istnieje
    const reservation = await Reservation.getById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Rezerwacja nie znaleziona' });
    }
    
    const success = await Reservation.delete(reservationId);
    
    if (success) {
      res.status(200).json({ message: 'Rezerwacja została usunięta pomyślnie' });
    } else {
      res.status(500).json({ message: 'Nie udało się usunąć rezerwacji' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania rezerwacji', error: error.message });
  }
};
