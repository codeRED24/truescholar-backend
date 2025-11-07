import crypto from "crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
const algorithm = "aes-256-cbc";

export const encryptData = (data: string) => {
  const iv = crypto.randomBytes(16);
  const cypher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cypher.update(data, "utf8", "hex");
  encrypted += cypher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptData = (encrypted: string) => {
  const [ivHex, enc] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(enc, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};