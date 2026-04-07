import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer | null;

  constructor(private config: ConfigService) {
    const keyHex = this.config.get<string>('ENCRYPTION_KEY');
    // ENCRYPTION_KEY is optional — if not set, encryption is a no-op (for dev/test)
    if (keyHex && keyHex.length >= 32) {
      this.key = Buffer.from(keyHex.slice(0, 32), 'utf8');
    } else {
      this.key = null;
    }
  }

  encrypt(plaintext: string): string {
    if (!this.key) return plaintext; // passthrough if no key configured
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:ciphertext (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(encrypted: string): string {
    if (!this.key) return encrypted; // passthrough if no key configured
    const parts = encrypted.split(':');
    if (parts.length !== 3) return encrypted; // not encrypted data, return as-is
    const [ivB64, authTagB64, ciphertextB64] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
