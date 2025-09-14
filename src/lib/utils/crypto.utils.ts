import CryptoJS from 'crypto-js'

/**
 * Convierte un string a hash MD5 y lo codifica en Base64 (igual que Java)
 * @param text - El texto a convertir
 * @returns El hash MD5 del texto codificado en Base64
 */
export function convertToMD5(text: string): string {
  // Generar hash MD5
  const md5Hash = CryptoJS.MD5(text)
  // Convertir a Base64 (igual que Java Base64.getEncoder().encodeToString())
  return CryptoJS.enc.Base64.stringify(md5Hash)
}

/**
 * Crea una clave AES de 16 bytes desde un string (igual que Java getKeyFromString)
 * @param keyStr - El string de la clave
 * @returns Los primeros 16 bytes de la clave como WordArray
 */
function getKeyFromString(keyStr: string): CryptoJS.lib.WordArray {
  // Convertir string a bytes UTF-8
  const keyBytes = CryptoJS.enc.Utf8.parse(keyStr)
  
  // Crear un array de 16 bytes (128 bits) igual que Java
  const keyArray = new Uint8Array(16)
  const sourceBytes = new Uint8Array(keyBytes.sigBytes)
  
  // Copiar bytes del WordArray a Uint8Array
  for (let i = 0; i < keyBytes.sigBytes; i++) {
    const wordIndex = Math.floor(i / 4)
    const byteIndex = i % 4
    sourceBytes[i] = (keyBytes.words[wordIndex] >>> (24 - byteIndex * 8)) & 0xff
  }
  
  // Copiar los primeros 16 bytes (o menos si la clave es más corta)
  const copyLength = Math.min(sourceBytes.length, 16)
  keyArray.set(sourceBytes.slice(0, copyLength))
  
  // Convertir de vuelta a WordArray para CryptoJS
  const words: number[] = []
  for (let i = 0; i < 16; i += 4) {
    const word = (keyArray[i] << 24) | (keyArray[i + 1] << 16) | (keyArray[i + 2] << 8) | keyArray[i + 3]
    words.push(word)
  }
  
  return CryptoJS.lib.WordArray.create(words, 16)
}

/**
 * Encripta un texto usando AES/ECB/PKCS5Padding (igual que Java)
 * @param text - El texto a encriptar
 * @param secret - La clave de encriptación
 * @returns El texto encriptado codificado en Base64
 */
export function encryptWithAES(text: string, secret: string): string {
  try {
    // Obtener clave de 16 bytes
    const key = getKeyFromString(secret)
    
    // Encriptar usando AES-ECB (igual que Java AES/ECB/PKCS5Padding)
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7 // PKCS7 es equivalente a PKCS5 para AES
    })
    
    // Retornar como Base64 (igual que Java Base64.getEncoder().encodeToString())
    return encrypted.toString()
  } catch (error) {
    throw new Error('Error al cifrar')
  }
}

/**
 * Desencripta un texto usando AES/ECB/PKCS5Padding (igual que Java)
 * @param encryptedText - El texto encriptado en Base64
 * @param secret - La clave de desencriptación
 * @returns El texto desencriptado
 */
export function decryptWithAES(encryptedText: string, secret: string): string {
  try {
    // Obtener clave de 16 bytes
    const key = getKeyFromString(secret)
    
    // Desencriptar usando AES-ECB
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // Convertir a string UTF-8
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedText) {
      throw new Error('OTP inválida')
    }
    
    return decryptedText
  } catch (error) {
    throw new Error('OTP inválida')
  }
}

/**
 * Proceso completo de cifrado del OTP (igual que Java):
 * 1. Convierte la frase a MD5 y luego a Base64
 * 2. Encripta el OTP con AES/ECB/PKCS5Padding usando el MD5 como clave
 * @param otp - El código OTP a encriptar
 * @param phrase - La frase del header X-PHRASE
 * @returns El OTP encriptado en Base64
 */
export function encryptOTP(otp: string, phrase: string): string {
  // Paso 1: Convertir la frase a MD5 y codificar en Base64 (igual que Java)
  const md5Key = convertToMD5(phrase)
  
  // Paso 2: Encriptar el OTP con AES usando el MD5 como clave (igual que Java)
  const encryptedOTP = encryptWithAES(otp, md5Key)
  
  return encryptedOTP
}