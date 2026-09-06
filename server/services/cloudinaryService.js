const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const isCloudinaryConfigured = () => {
    const name = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    return (
        name &&
        key &&
        secret &&
        name !== 'demo' &&
        name !== 'your_cloud_name' &&
        key !== '1234567890' &&
        key !== 'your_api_key'
    );
};

if (isCloudinaryConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/**
 * Fallback to local disk storage when Cloudinary is unconfigured or unavailable
 */
const saveLocally = (fileContent, subfolder = 'photos') => {
    const uploadDir = path.join(__dirname, '../uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const matches = fileContent.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        buffer = Buffer.from(matches[2], 'base64');
    } else {
        buffer = Buffer.from(fileContent.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${subfolder}/${filename}`;
    return {
        secure_url: relativeUrl,
        url: relativeUrl,
        public_id: filename,
    };
};

/**
 * Upload an image (base64 or file path) to Cloudinary, with local storage fallback
 * @param {string} fileContent - The file content to upload
 * @param {string} folder - The folder to upload into
 * @returns {Promise<object>} - The upload result
 */
const uploadImage = async (fileContent, folder = process.env.CLOUDINARY_KEY_NAME || 'DeliveryProof') => {
    if (isCloudinaryConfigured()) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Cloudinary upload timed out')), 3500)
            );
            const uploadPromise = cloudinary.uploader.upload(fileContent, {
                folder: folder,
                resource_type: 'auto'
            });
            const result = await Promise.race([uploadPromise, timeoutPromise]);
            return result;
        } catch (error) {
            console.warn('Cloudinary upload error or timeout, using local fallback:', error.message);
        }
    }

    // Graceful fallback to local file storage
    const subfolder = folder.includes('signatures') ? 'signatures' : 'photos';
    return saveLocally(fileContent, subfolder);
};

module.exports = {
    uploadImage,
    cloudinary
};
