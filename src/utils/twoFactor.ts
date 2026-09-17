// Standard RFC 6238 TOTP generator and verifier using Web Crypto API

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate random Base32 secret string (16 characters / 80 bits)
export function generate2FASecret(): string {
  const bytes = new Uint8Array(20);
  window.crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

// Generate 5 emergency backup recovery codes
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let i = 0; i < 5; i++) {
    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    let part1 = '';
    let part2 = '';
    for (let j = 0; j < 4; j++) {
      part1 += chars[bytes[j] % chars.length];
      part2 += chars[bytes[j + 4] % chars.length];
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

// Decode Base32 string to Uint8Array
function base32Decode(str: string): Uint8Array {
  const cleaned = str.toUpperCase().replace(/[\s-]/g, '');
  const length = cleaned.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.floor((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    const val = BASE32_CHARS.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}

// Compute 6-digit TOTP code for a secret and a specific unix timestamp (seconds)
export async function getTOTPCode(secret: string, timestampSeconds = Math.floor(Date.now() / 1000)): Promise<string> {
  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) return '000000';

  const timeStep = Math.floor(timestampSeconds / 30);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  // Big-endian 64-bit integer
  timeView.setUint32(0, Math.floor(timeStep / 0x100000000));
  timeView.setUint32(4, timeStep & 0xffffffff);

  // Import key for HMAC-SHA1
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const hash = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify a user-provided 6-digit code with window drift tolerance (+/- 30 seconds)
export async function verifyTOTPCode(secret: string, code: string): Promise<boolean> {
  const trimmed = code.trim().replace(/\s/g, '');
  if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
    return false;
  }

  const currentSeconds = Math.floor(Date.now() / 1000);
  // Check current window, -1 window, and +1 window
  const windows = [0, -30, 30, -60, 60];

  for (const offset of windows) {
    const validCode = await getTOTPCode(secret, currentSeconds + offset);
    if (validCode === trimmed) {
      return true;
    }
  }

  return false;
}

// Format secret into human-readable 4-character chunks
export function formatSecretKey(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

// Create standard otpauth URI
export function getOTPAuthURL(secret: string, email: string): string {
  const label = encodeURIComponent(`Daily Habit & Recovery:${email}`);
  const issuer = encodeURIComponent('Daily Habit & Recovery');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
