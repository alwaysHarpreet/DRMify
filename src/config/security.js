export const securityConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: "15m",
  accessTokenExpiry: "5m",
  encryptionAlgorithm: "aes-256-gcm",
  get masterKey() {
    return Buffer.from(process.env.MASTER_ENCRYPTION_KEY, "hex");
  }
};