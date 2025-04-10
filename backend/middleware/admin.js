module.exports = (req, res, next) => {
    // Sprawdź, czy użytkownik jest zalogowany i czy ma uprawnienia administratora
    if (!req.userData || !req.userData.isAdmin) {
      return res.status(403).json({ message: 'Brak uprawnień administratora' });
    }
    
    next();
  };
  