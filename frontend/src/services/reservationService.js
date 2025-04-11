import api, { withAdminAuth } from './api'

export const createReservation = async (reservationData) => {
  try {
    const response = await api.post('/reservations', reservationData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getReservations = async () => {
  try {
    const response = await api.get('/reservations', withAdminAuth())
    return response.data
  } catch (error) {
    throw error
  }
}

export const getReservationById = async (id) => {
  try {
    const response = await api.get(`/reservations/${id}`, withAdminAuth())
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateReservationStatus = async (id, status) => {
  try {
    const response = await api.put(
      `/reservations/${id}/status`,
      { status },
      withAdminAuth()
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteReservation = async (id) => {
  try {
    const response = await api.delete(`/reservations/${id}`, withAdminAuth())
    return response.data
  } catch (error) {
    throw error
  }
}
