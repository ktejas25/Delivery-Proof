const crypto = require('crypto');

/**
 * Mocks a blockchain timestamping service.
 * In production, this would send a hash to a public or private blockchain.
 */
const anchorProof = async (proofData) => {
    // 1. Create a content hash of the proof
    const hash = crypto.createHash('sha256')
                       .update(JSON.stringify(proofData))
                       .digest('hex');

    // 2. Mock a blockchain transaction
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    return {
        contentHash: hash,
        blockchainTxHash: txHash,
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    anchorProof
};
