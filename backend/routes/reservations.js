const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Publiczne endpointy
router.post('/', reservationController.createReservation);
router.get('/', reservationController.getAllReservations); 

// Tymczasowo publiczny
router.get('/:id', reservationController.getReservationById);

// Endpointy dla administratorów
router.get('/', adminMiddleware, reservationController.getAllReservations);
router.get('/:id', adminMiddleware, reservationController.getReservationById);
router.put('/:id/status', adminMiddleware, reservationController.updateReservationStatus);
router.delete('/:id', adminMiddleware, reservationController.deleteReservation);

module.exports = router;
