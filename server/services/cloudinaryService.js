const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image (base64 or file path) to Cloudinary
 * @param {string} fileContent - The file content to upload
 * @param {string} folder - The folder to upload into
 * @returns {Promise<object>} - The upload result
 */
const uploadImage = async (fileContent, folder = process.env.CLOUDINARY_KEY_NAME || 'DeliveryProof') => {
    try {
        const result = await cloudinary.uploader.upload(fileContent, {
            folder: folder,
            resource_type: 'auto'
        });
        return result;
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw error;
    }
};

module.exports = {
    uploadImage,
    cloudinary
};
