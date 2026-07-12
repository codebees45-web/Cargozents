const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');

let client = null;
let isReady = false;

const initWhatsApp = () => {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }), // persists login, avoids re-scanning QR every restart
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',           // 👈 Prevents Chromium memory crashes
        '--disable-features=site-per-process' // 👈 Crucial: Fixes the 'detached Frame' issue
      ],
    },
  });

  client.on('qr', (qr) => {
    logger.info('Scan this QR code with WhatsApp (Linked Devices) to log in:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    logger.info('WhatsApp client is ready');
  });

  client.on('auth_failure', (msg) => {
    logger.error(`WhatsApp auth failed: ${msg}`);
  });

  client.on('disconnected', async (reason) => {
    isReady = false;
    logger.error(`WhatsApp client disconnected: ${reason}. Attempting recovery re-initialization...`);
    
    // 👈 Gracefully wipe out the broken browser session and restart a clean client
    try {
      await client.destroy();
      client = null; // Clear out current reference
      initWhatsApp(); // Spin up a fresh client instance automatically
    } catch (err) {
      logger.error(`[WHATSAPP] Critical failure during automatic recovery: ${err.message}`);
    }
  });

  client.initialize();
  return client;
};

/**
 * Sends a WhatsApp message.
 * @param {string} phone - Number in international format WITHOUT + or leading zeros, e.g. "919876543210"
 * @param {string} message
 */
const sendWhatsApp = async (phone, message) => {
  if (!client || !isReady) {
    logger.error('[WHATSAPP] Client not ready — message not sent. Make sure the server has scanned the QR code and stayed logged in.');
    return false;
  }

  try {
    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, message);
    logger.info(`[WHATSAPP] Sent to ${phone}`);
    return true;
  } catch (err) {
    logger.error(`[WHATSAPP] Failed to send to ${phone}: ${err.message}`);
    return false;
  }
};

module.exports = { initWhatsApp, sendWhatsApp };