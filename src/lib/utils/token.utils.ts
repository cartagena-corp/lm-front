/**
 * Utility functions for handling JWT tokens
 */

/**
 * Extracts the user ID from a JWT token
 * @param token - The JWT token
 * @returns The user ID extracted from the token
 * @throws Error if the token is invalid or userId cannot be extracted
 */
export const getUserIdFromToken = (token: string): string => {
   try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub || payload.userId || payload.id
   } catch (error) {
      console.error('Error extracting userId from token:', error)
      throw new Error('Token inválido')
   }
}
