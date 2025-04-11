import api, { withAdminAuth } from './api';

export const loginAdmin = async (adminKey) => {
  try {
    // Zapisz klucz administratora w localStorage
    localStorage.setItem('adminKey', adminKey);
    
    // Sprawdź, czy klucz jest poprawny, próbując pobrać rezerwacje
    const response = await api.get('/reservations', withAdminAuth());
    
    // Jeśli nie ma błędu, oznacza to, że klucz jest poprawny
    return { success: true };
  } catch (error) {
    // Usuń klucz, jeśli jest niepoprawny
    localStorage.removeItem('adminKey');
    throw error;
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminKey');
  return { success: true };
};

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminKey');
};
