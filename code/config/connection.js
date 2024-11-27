require("dotenv").config();
const mongoose = require("mongoose");
const { getSecret } = require("./keyvault");

async function putKeyVaultSecretInEnvVar() {
    // Skip Key Vault lookup in development mode
    if (process.env.ENVIRONMENT === "development") {
        console.log("Development mode detected: Skipping Key Vault lookup.");
        if (!process.env.DATABASE_URL) {
            console.error("Error: DATABASE_URL must be set in .env for development mode.");
            throw new Error("Missing DATABASE_URL in development mode.");
        }
        return; 
    }

    const secretName = process.env.KEY_VAULT_SECRET_NAME_DATABASE_URL;
    const keyVaultName = process.env.KEY_VAULT_NAME;

    console.log("Key Vault Secret Name:", secretName || "(Not Set)");
    console.log("Key Vault Name:", keyVaultName || "(Not Set)");

    if (!secretName || !keyVaultName) {
        throw new Error(
            "Key Vault parameters missing: Ensure 'KEY_VAULT_SECRET_NAME_DATABASE_URL' and 'KEY_VAULT_NAME' are set in the environment variables."
        );
    }

    try {
        const connectionString = await getSecret(secretName, keyVaultName);
        if (!connectionString) {
            throw new Error("Key Vault returned an empty connection string.");
        }
        process.env.DATABASE_URL = connectionString;
        console.log("Database connection string successfully fetched from Key Vault.");
    } catch (err) {
        console.error("Error retrieving database connection string from Key Vault:", err.message);
        throw err;
    }
}

async function getConnectionInfo() {
    if (!process.env.DATABASE_URL) {
        console.log("DATABASE_URL not found in environment variables. Attempting to fetch from Key Vault...");
        await putKeyVaultSecretInEnvVar();

        if (!process.env.DATABASE_URL) {
            throw new Error(
                "DATABASE_URL is not set in the environment variables and could not be fetched from Key Vault."
            );
        }
    }

    const DATABASE_NAME = process.env.DATABASE_NAME || "default-database";

    console.log("Connection Info:", {
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_NAME,
    });

    return {
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_NAME,
    };
}

module.exports = {
    getConnectionInfo,
};


