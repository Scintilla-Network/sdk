/**
 * Wait for a specified number of milliseconds
 * @param {number} ms - The number of milliseconds to wait
 * @returns {Promise<void>} A promise that resolves when the wait is complete
 */
export default async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
