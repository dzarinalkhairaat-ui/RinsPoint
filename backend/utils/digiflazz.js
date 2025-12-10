const crypto = require('crypto');
const axios = require('axios');

const BASE_URL = 'https://api.digiflazz.com/v1';

const getSignature = (cmd) => {
    const unsigned = process.env.DIGIFLAZZ_USERNAME + process.env.DIGIFLAZZ_API_KEY + cmd;
    return crypto.createHash('md5').update(unsigned).digest('hex');
};

const digiflazzRequest = async (endpoint, payload) => {
    try {
        const response = await axios.post(`${BASE_URL}/${endpoint}`, {
            username: process.env.DIGIFLAZZ_USERNAME,
            ...payload
        });
        return response.data;
    } catch (error) {
        console.error('Digiflazz Error:', error.response?.data || error.message);
        // Jangan throw error agar frontend tetap terima JSON error
        return error.response?.data || { data: [] }; 
    }
};

module.exports = { getSignature, digiflazzRequest };