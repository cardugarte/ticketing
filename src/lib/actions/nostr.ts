import { getPublicKey, nip04, finalizeEvent, type Event, nip19 } from 'nostr-tools';
import { SimplePool } from 'nostr-tools/pool';

const RELAYS = [
  'wss://relay.current.fyi',
  'wss://nostr.wine',
  'wss://purplepag.es',
  'wss://relay.damus.io',
];

// Validar y decodificar la clave privada desde .env
if (!process.env.NEXT_NOSTR_PRIVATE_KEY) {
  throw new Error('NEXT_NOSTR_PRIVATE_KEY environment variable is not set');
}

const senderPrivateKey = process.env.NEXT_NOSTR_PRIVATE_KEY;
const decodedPrivateKey = /^[0-9a-fA-F]{64}$/.test(senderPrivateKey)
  ? senderPrivateKey
  : nip19.decode(senderPrivateKey).data as string;

const senderPublicKey = getPublicKey(Uint8Array.from(Buffer.from(decodedPrivateKey, 'hex')));

// Turn NIP-05 to hex
async function resolveNIP05(nip05: string): Promise<string> {
  const [localPart, domain] = nip05.split('@');
  if (!localPart || !domain) throw new Error('Formato NIP-05 inválido');

  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error al consultar NIP-05: ${response.statusText}`);

  const data = await response.json();
  const pubkey = data.names?.[localPart];
  if (!pubkey || !/^[0-9a-fA-F]{64}$/.test(pubkey)) throw new Error('Pubkey no encontrada o inválida en NIP-05');
  return pubkey;
}

// Normalize NIP-05, npub formats to hex
async function normalizePubkey(input: string): Promise<string> {
  if (/^[0-9a-fA-F]{64}$/.test(input)) return input;
  if (input.startsWith('npub')) return nip19.decode(input).data as string;
  if (input.includes('@')) return await resolveNIP05(input);
  throw new Error('Formato de pubkey no soportado: debe ser hex, npub o NIP-05');
}

// Send NOSTR message
export async function sendNOSTRMessage(userPubKey: string, orderId: string): Promise<boolean> {
  // Normalize pubkey
  const normalizedPubkey = await normalizePubkey(userPubKey);
  // Create QR
  const qrContent = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(orderId)}&size=200x200`;
  const message = `
  ¡Tu ticket para el Martes de Cowork de La Crypta!
  \n
  🎟 Código de ticket: 
  ${orderId}
  \n
  🔍 Escanea este QR para el check-in:
  ${qrContent}
  \n
  ¡Gracias por tu colaboración! 🫡`;

  // Encrypt message
  const encryptedContent = await nip04.encrypt(decodedPrivateKey, normalizedPubkey, message);

  // Create event 4 (private message)
  const event: Event = {
    kind: 4,
    pubkey: senderPublicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', normalizedPubkey]],
    content: encryptedContent,
    id: '',
    sig: ''
  };

  // Sign event
  const signedEvent = finalizeEvent(event, Uint8Array.from(Buffer.from(decodedPrivateKey, 'hex')));

  // Send message to relays
  const pool = new SimplePool();
  try {
    const publishPromises = pool.publish(RELAYS, signedEvent);
    const results = await Promise.allSettled(publishPromises);

    const success = results.some(result => result.status === 'fulfilled');
    if (success) {
      console.log(`Mensaje enviado exitosamente a ${normalizedPubkey} vía pool de relays`);
      return true;
    } else {
      throw new Error('Ningún relay aceptó el evento');
    }
  } catch (error) {
    console.error('Error general enviando mensaje:', error);
    throw error;
  } finally {
    pool.close(RELAYS);
  }
}