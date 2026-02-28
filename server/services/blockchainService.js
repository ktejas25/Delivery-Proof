const crypto = require('crypto');

/**
 * Mocks a blockchain transaction for proof immutable storage.
 * In a real-world scenario, this would interact with Ethereum, Polygon, or Hyperledger.
 */
const submitToBlockchain = async (proofData) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a "transaction hash" based on proof content
    const content = JSON.stringify(proofData);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    
    return `0x${hash}`;
};

module.exports = {
    submitToBlockchain
};
