'use strict';

/**
 * Ex2ServerClient
 * ---------------
 * Manages a persistent TCP connection to the Exercise-2 C++ server.
 * The Ex-2 protocol is line-based text:
 *   Request:  "<COMMAND> <arg1> <arg2> ...\n"
 *   Response: "<STATUS_LINE>\n\n<body>\n"  (body present only for GET)
 *
 * Commands supported by Ex-2:
 *   POST   <userId> <productId1> [productId2 ...]   → 201 Created
 *   PATCH  <userId> <productId1> [productId2 ...]   → 204 No Content
 *   DELETE <userId> <productId1> [productId2 ...]   → 204 No Content
 *   GET    <userId> <productId>                     → 200 Ok\n\n<rec1> <rec2> ...
 */

const net = require('net');

const EX2_HOST = process.env.EX2_HOST || '127.0.0.1';
const EX2_PORT = parseInt(process.env.EX2_PORT || '5555', 10);

/**
 * Sends a single command to the Ex-2 server and resolves with its raw response.
 * Opens a fresh TCP connection per call (keeps things simple and stateless).
 *
 * @param {string} command - full command line, e.g. "POST user1 product42"
 * @returns {Promise<string>} raw response text
 */
function sendCommand(command) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: EX2_HOST, port: EX2_PORT }, () => {
      socket.write(command + '\n');
    });

    let data = '';
    socket.on('data', chunk => {
      data += chunk.toString();
      // The Ex-2 server sends one response per command then keeps the socket open.
      // We consider the response complete when we have at least one newline.
      if (data.includes('\n')) {
        socket.destroy();
        resolve(data.trim());
      }
    });

    socket.on('error', err => reject(err));
    socket.on('close', () => resolve(data.trim()));

    // Safety timeout – avoid hanging forever if Ex-2 is unresponsive
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('Ex-2 server timeout'));
    });
  });
}

/**
 * Parses the status code from an Ex-2 response line.
 * E.g. "200 Ok" → 200,  "201 Created" → 201
 */
function parseStatus(response) {
  const match = response.match(/^(\d{3})/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── High-level helpers ───────────────────────────────────────────────────────

/**
 * Registers a new user (and their viewed product) in Ex-2.
 * Uses POST to create the user entry.
 */
async function registerUserWithProduct(userId, productId) {
  try {
    const resp = await sendCommand(`POST ${userId} ${productId}`);
    return parseStatus(resp);
  } catch {
    return null;
  }
}

/**
 * Records that a user viewed a product (PATCH appends to their list).
 * Called when GET /api/restaurants/:id/products/:pId is invoked.
 */
async function recordProductView(userId, productId) {
  try {
    const resp = await sendCommand(`PATCH ${userId} ${productId}`);
    return parseStatus(resp);
  } catch {
    return null;
  }
}

/**
 * Removes a product from a user's view history (DELETE).
 */
async function removeProductFromUser(userId, productId) {
  try {
    const resp = await sendCommand(`DELETE ${userId} ${productId}`);
    return parseStatus(resp);
  } catch {
    return null;
  }
}

/**
 * Gets recommendations for a user based on a product.
 * @returns {Promise<string[]>} list of recommended product ids
 */
async function getRecommendations(userId, productId) {
  try {
    const resp = await sendCommand(`GET ${userId} ${productId}`);
    const lines = resp.split('\n');
    // Format: "200 Ok\n\n<p1> <p2> ..."
    if (!lines[0].startsWith('200')) return [];
    const body = lines.slice(2).join(' ').trim();
    if (!body) return [];
    return body.split(/\s+/).filter(Boolean);
  } catch {
    return [];
  }
}

module.exports = {
  sendCommand,
  parseStatus,
  registerUserWithProduct,
  recordProductView,
  removeProductFromUser,
  getRecommendations,
};