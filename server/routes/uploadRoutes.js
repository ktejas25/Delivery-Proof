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
router.post('/photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No photo provided' });
        
        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const result = await uploadImage(dataURI, 'delivery_proofs/photos');
        res.json({ url: result.secure_url });
    } catch (error) {
        res.status(500).json({ message: 'Photo upload failed', error: error.message });
    }
});

// Upload Signature
router.post('/signature', async (req, res) => {
    try {
        const { signature } = req.body; // Expecting base64 PNG
        if (!signature) return res.status(400).json({ message: 'No signature provided' });
        
        const result = await uploadImage(signature, 'delivery_proofs/signatures');
        res.json({ url: result.secure_url });
    } catch (error) {
        res.status(500).json({ message: 'Signature upload failed', error: error.message });
    }
});

module.exports = router;
