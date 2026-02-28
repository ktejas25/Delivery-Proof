const express = require('express');
const { getModules, getSupportedLanguages } = require('../controllers/i18nController');
const router = express.Router();

router.get('/languages', getSupportedLanguages);
router.get('/translations/:lang', getModules);

module.exports = router;
