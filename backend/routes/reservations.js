const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Publiczne endpointy
router.post('/', reservationController.createReservation);

// Endpointy dla administratorów (zabezpieczone kluczem admin)
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.put('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
