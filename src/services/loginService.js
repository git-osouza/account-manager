import request from './http';

export const login = async (user) => {
  try {
    const response = await request.post('/auth.php', user);
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const validateToken = async (token) => {
  try {
    const response = await request.get('/validate.php', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro na validação do token:', error);
    throw error;
  }
};
