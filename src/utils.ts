/**
 * Check if a string is a valid Arweave address
 *
 * @param addr string to test for
 * @returns valid or not
 */
export const isAddress = (addr: string) => /^[a-z0-9_-]{43}$/i.test(addr);
