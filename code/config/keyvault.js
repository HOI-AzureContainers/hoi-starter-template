const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const getSecret = async (secretName, keyVaultName) => {
    if (!secretName || !keyVaultName) {
        throw new Error("getSecret: Required parameters 'secretName' or 'keyVaultName' are missing.");
    }

    const credential = new DefaultAzureCredential();
    const url = `https://${keyVaultName}.vault.azure.net`;

    try {
        console.log(`Connecting to Key Vault at: ${url}`);

        // Create client to connect to Azure Key Vault
        const client = new SecretClient(url, credential);

        // Retrieve the secret
        const latestSecret = await client.getSecret(secretName);
        console.log(`Retrieved secret: ${secretName}`);

        return latestSecret.value;
    } catch (error) {
        console.error(`Failed to retrieve secret '${secretName}' from Key Vault '${keyVaultName}':`, error.message);
        throw error;
    }
};

module.exports = {
    getSecret
};
