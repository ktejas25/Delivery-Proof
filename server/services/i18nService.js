const pool = require('../config/database');

const getTranslations = async (language_code, module = null) => {
    try {
        let query = `
            SELECT tk.key_name, t.translated_text, tk.module 
            FROM translations t 
            JOIN translation_keys tk ON t.key_id = tk.id 
            JOIN languages l ON t.language_id = l.id 
            WHERE l.code = ?
        `;
        const params = [language_code];

        if (module) {
            query += ' AND tk.module = ?';
            params.push(module);
        }

        const [rows] = await pool.query(query, params);
        
        // Convert to key-value object
        return rows.reduce((acc, row) => {
            acc[row.key_name] = row.translated_text;
            return acc;
        }, {});
    } catch (error) {
        console.error('Translation fetch failed', error);
        return {};
    }
};

module.exports = {
    getTranslations
};
