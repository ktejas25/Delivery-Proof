const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../services/cloudinaryService');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.use(authenticateToken);

// Upload Photo
router.post('/photo', async (req, res) => {
    try {
        // Since we are using express.json() with high limits,
        // we handle base64 uploads here. 
        // Multer is better for multipart files, but for base64 JSON, body works best.
        
        let fileContent = null;
        if (req.body.photo) {
            fileContent = req.body.photo;
        }

        if (!fileContent) {
            // Check if it's actually coming through as multipart (fallback)
            return res.status(400).json({ message: 'No photo provided or content-type mismatch' });
        }
        
        const result = await uploadImage(fileContent, 'delivery_proofs/photos');
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ message: 'Photo upload failed', error: error.message });
    }
});

// Upload Signature
router.post('/signature', async (req, res) => {
    try {
        const { signature } = req.body;
        if (!signature) return res.status(400).json({ message: 'No signature provided' });
        
        const result = await uploadImage(signature, 'delivery_proofs/signatures');
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Signature upload error:', error);
        res.status(500).json({ message: 'Signature upload failed', error: error.message });
    }
});

module.exports = router;
