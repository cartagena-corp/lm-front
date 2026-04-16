import { NextRequest, NextResponse } from "next/server";

// @ts-expect-error – paquete sin tipado
import Dukpt from "@atmira/dukpt3des";

// ─────────────────────────────────────────────
//  Helpers replicados de test-dukpt.js
// ─────────────────────────────────────────────
function getPaddedUdid(udid: string): string {
  let encryptionBDK = "11111111111111111111111111111111"; // Longitud 32
  let res = udid;
  for (var i = 0; i < encryptionBDK.length - res.length; i++) {
    res = "0" + res;
  }
  return res;
}

function tripleDesLibrary(plainHex: string, paddedUdidHex: string): string {
  const key = hexstringToData(paddedUdidHex);
  const data = hexstringToData(plainHex);
  const resultBin = Dukpt._des(key, data, true, 0, null, 0);
  return dataToHexstring(resultBin);
}


function hexstringToData(hexString: string): string {
  const hex = hexString.replace(/\s/g, "");
  const pairs = hex.match(/../g) ?? [];
  let s = "";
  for (const pair of pairs) {
    s += String.fromCharCode(Number("0x" + pair));
  }
  return s;
}

function dataToHexstring(data: string): string {
  let hex = "";
  for (let i = 0; i < data.length; i++) {
    let h = data.charCodeAt(i).toString(16);
    if (h.length < 2) h = "0" + h;
    hex += h;
  }
  return hex.toUpperCase();
}

function docTypeSwitchTransform(docType: string): string {
  switch (docType) {
    case "1": return "1";
    case "2": return "4";
    case "3": return "2";
    case "4": return "6";
    case "5": return "5";
    case "7": return "2";
    case "9": return "3";
    case "6": return "10";
    case "12": return "9";
    default: return "0";
  }
}

function generatePinBlock(pin: string, pan: string, docType: string): string {
  // Paso 1: Construir bloque1 = "0" + pin.length + pin
  let block1 = "0" + String(pin).length + pin;

  // Paso 2: bloque2 = número de documento como string
  let block2 = String(pan);

  // Paso 3: Rellenar bloque1 con F a la derecha hasta 16 caracteres
  while (block1.length < 16) block1 = block1 + "F";

  // Paso 4: Rellenar bloque2 con 0 a la izquierda hasta 10 caracteres
  while (block2.length < 10) block2 = "0" + block2;

  // Paso 5: Agregar tipo de documento al inicio de bloque2
  block2 = docTypeSwitchTransform(String(docType)) + block2;

  // Paso 6: Rellenar bloque2 con 0 a la izquierda hasta 16 caracteres
  while (block2.length < 16) block2 = "0" + block2;

  // Paso 7-8: Convertir bloques de hexadecimal a ASCII
  let data1 = hexstringToData(block1);
  let data2 = hexstringToData(block2);

  // Paso 9: Igualar longitudes con bytes nulos
  while (data1.length < data2.length) data1 = "\0" + data1;
  while (data1.length > data2.length) data2 = "\0" + data2;

  // Paso 10: XOR
  let output = "";
  for (let i = 0; i < data1.length; i++) {
    output += String.fromCharCode(data1.charCodeAt(i) ^ data2.charCodeAt(i));
  }

  // Paso 11: Convertir resultado a hexadecimal
  return dataToHexstring(output);
}


function encryptForPinBlock(
  plain: string,
  account: string,
  bdk: string,
  ksnParam: string,
  ipek: string,
  udid: string
): string {
  const options = {
    inputEncoding: "hex",
    outputEncoding: "hex",
    encryptionMode: "3DES",
    forPinBlock: true,
  };

  // Paso 13: Descifrar IPEK
  const dukptServer = new Dukpt(bdk, ksnParam);
  const ipekClaro = dukptServer.dukptDecrypt(ipek, {
    inputEncoding: "hex",
    outputEncoding: "hex",
    decryptionMode: "3DES",
  }) as string;

  // Paso 14: Remover últimos 4 del KSN
  let ksn = ksnParam.substring(0, ksnParam.length - 4);

  // Paso 15: Agregar últimos 4 del número de cuenta al final del KSN
  ksn = ksn + account.substring(account.length - 4, account.length);
  ksn = ksn.toUpperCase();

  // Paso 17-18: Inicializar motor DUKPT y derivar clave de sesión
  const dukpt = new Dukpt(bdk, ksn);
  dukpt._deriveDukptSessionKeyForPinBlock(ipekClaro.toUpperCase());

  // Paso 19: Cifrar con la clave de sesión DUKPT
  return dukpt.dukptEncrypt(plain, options) as string;
}

// ─────────────────────────────────────────────
//  Route Handler
// ─────────────────────────────────────────────

export interface DukptRequestBody {
  bdk: string;
  ksn: string;
  ipek: string;
  pin: string;
  docNum: string;
  docType: string;
  account: string;
  udid: string;
}

export interface DukptResponseBody {
  pinBlock: string;
  encryptedPinBlock: string;
  encryptedBdk: string;
  encryptedKsn: string;
  encryptedIpek: string;
  steps: Record<string, string>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: DukptRequestBody = await request.json();
    const { bdk, ksn, ipek, pin, docNum, docType, account, udid } = body;

    if (!bdk || !ksn || !ipek || !pin || !docNum || !docType || !account || !udid) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const pinBlock = generatePinBlock(pin, docNum, docType);
    const encryptedPinBlock = encryptForPinBlock(
      pinBlock,
      account,
      bdk,
      ksn,
      ipek,
      udid
    );

    const paddedKey = getPaddedUdid(udid);

    // Desciframos la IPEK aquí también para guardarla limpia en Storage
    const dukptServer = new Dukpt(bdk, ksn);
    const ipekClaro = dukptServer.dukptDecrypt(ipek, {
      inputEncoding: "hex",
      outputEncoding: "hex",
      decryptionMode: "3DES",
    }) as string;

    const encryptedBdk = tripleDesLibrary(bdk, paddedKey);
    const encryptedKsn = tripleDesLibrary(ksn.substring(0, 16), paddedKey);
    const encryptedIpek = tripleDesLibrary(ipekClaro.toUpperCase(), paddedKey);

    return NextResponse.json<DukptResponseBody>({
      pinBlock,
      encryptedPinBlock,
      encryptedBdk,
      encryptedKsn,
      encryptedIpek,
      steps: {
        step1: "Bloque1 construido: 0 + pin.length + pin",
        step2: "Bloque2 = número de documento",
        step3: "Bloque1 rellenado con F hasta 16 chars",
        step4: "Bloque2 rellenado con 0 hasta 10 chars",
        step5: "Tipo de documento prefijado al bloque2",
        step6: "Bloque2 rellenado con 0 hasta 16 chars",
        step7: "Bloque1 convertido de hex a ASCII",
        step8: "Bloque2 convertido de hex a ASCII",
        step9: "Longitudes igualadas con bytes nulos",
        step10: "XOR aplicado entre bloque1 y bloque2",
        step11: "Resultado XOR convertido a hexadecimal",
        step12: "BDK recibida directamente",
        step13: "KSN recibida directamente",
        step14: "Últimos 4 bytes del KSN removidos",
        step15: "Últimos 4 de cuenta agregados al KSN",
        step16: "IPEK recibida directamente",
        step17: "Motor DUKPT inicializado con BDK y KSN",
        step18: "Clave de sesión DUKPT derivada para PIN Block",
        step19: "PIN Block cifrado con clave de sesión DUKPT",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
