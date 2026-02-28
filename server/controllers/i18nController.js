const { getTranslations } = require('../services/i18nService');
const pool = require('../config/database');

const getModules = async (req, res) => {
    const { lang } = req.params;
    const { module } = req.query;
    
    const translations = await getTranslations(lang, module);
    res.json(translations);
};

const getSupportedLanguages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT code, name, native_name, is_rtl FROM languages WHERE is_active = 1');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getModules,
    getSupportedLanguages
};
