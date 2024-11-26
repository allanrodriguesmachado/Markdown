import axios from 'axios';

export async function Filters(category, selectedValue) {
  try {
    const response = await axios.request({
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://tarja.mercatus.com.br/${category}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: selectedValue
    });

    return response.data.map((department) => ({
      label: department.nome,
      value: department.departamento_key
    }));
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error.response ? error.response.data : error.message);
    throw error;
  }
}
