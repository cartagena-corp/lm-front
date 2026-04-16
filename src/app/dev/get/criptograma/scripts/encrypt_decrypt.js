const Dukpt = require("@atmira/dukpt3des");

// Acceder a las utilidades internas de la librería para replicar el "bug" exacto
// Nota: Dukpt ya importa DataOperations internamente si estamos en el entorno adecuado,
// pero si no, podemos intentar acceder a ellas.
// En la versión 0.2.0, están disponibles en Dukpt (si no, las definimos igual)

const DataOperations = {
  hexstringToData: function (hexString) {
    let hex = hexString.replace(/\s/g, "");
    const keyar = hex.match(/../g);
    let s = "";
    if (keyar) {
      for (let i = 0; i < keyar.length; i++) {
        s += String.fromCharCode(Number(`0x${keyar[i]}`));
      }
    }
    return s;
  },
  dataToHexstring: function (d) {
    let hex = "";
    for (let i = 0; i < d.length; i++) {
      let h = d.charCodeAt(i).toString(16);
      if (h.length < 2) h = `0${h}`;
      hex += h;
    }
    return hex.toUpperCase();
  },
};

/**
 * 1. LÓGICA DE PADDING (REPRODUCCIÓN DEL BUG ORIGINAL)
 */
function getBuggyPaddedUdid(udid) {
  let encryptionBDK = "11111111111111111111111111111111";
  let res = udid;
  for (var i = 0; i < encryptionBDK.length - res.length; i++) {
    res = "0" + res;
  }
  return res;
}

/**
 * 2. TRIPLE DES USANDO MÉTODOS INTERNOS DE LA LIBRERÍA
 * Esto asegura que el comportamiento sea IDÉNTICO.
 */
function tripleDesLibrary(plainHex, paddedUdidHex) {
  // Convertir a binario usando la lógica de la librería (charCodeAt)
  const key = DataOperations.hexstringToData(paddedUdidHex);
  const data = DataOperations.hexstringToData(plainHex);

  // El método _des de la librería maneja Triple DES si la llave > 8 bytes
  // y usa el padding/encoding que el proyecto espera.
  // Firma: _des(key, message, encrypt, mode, iv, padding)
  const resultBin = Dukpt._des(key, data, true, 0, null, 0);

  return DataOperations.dataToHexstring(resultBin);
}

/**
 * 3. LÓGICA DE PIN BLOCK
 */
function docTypeSwitchTransform(docType) {
  switch (String(docType)) {
    case "1":
      return "1";
    case "2":
      return "4";
    case "3":
      return "2";
    case "4":
      return "6";
    case "5":
      return "5";
    case "7":
      return "2";
    case "9":
      return "3";
    case "6":
      return "10";
    case "12":
      return "9";
    default:
      return "0";
  }
}

function generatePinBlock(pin, pan, docType) {
  let block1 = "0" + String(pin).length + pin;
  while (block1.length < 16) block1 = block1 + "F";
  let block2 = String(pan);
  while (block2.length < 10) block2 = "0" + block2;
  block2 = docTypeSwitchTransform(docType) + block2;
  while (block2.length < 16) block2 = "0" + block2;

  let res = "";
  for (let i = 0; i < 16; i++) {
    const v1 = parseInt(block1[i], 16);
    const v2 = parseInt(block2[i], 16);
    res += (v1 ^ v2).toString(16).toUpperCase();
  }
  return res;
}

// ========================================================
// DATOS DE ENTRADA
// ========================================================
const input = {
  udid: "a71882df9cd22f06",
  bdk: "E19F787D8765551866184D59A0C35A8E",
  ksn: "a71882df9cE00000",
  ipekCifrada: "5F6535F756E80F561A593E34DF2E0A5B",
  pin: "839732",
  docNum: "20686722",
  docType: "1",
  account: "efe138ae",
};

const expected = {
  encBdk: "1B6389F780D0D681A6FE24EA5F09D524",
  encKsn: "4C40145828C3AB60",
  encIpekStorage: "28D3C0145374EE8DEAE33BCA46B8138E",
  pinBlock: "06839632DF9798DD",
  cipherPinBlock: "A035F329C39C7D50",
};

function runTest() {
  console.log(
    "Iniciando validación FINAL (Alineación con Librería Original)...",
  );

  // PASO 1: Descifrar la IPEK recibida con DUKPT
  const dukptServer = new Dukpt(input.bdk, input.ksn);
  const optionsDukpt = {
    inputEncoding: "hex",
    outputEncoding: "hex",
    decryptionMode: "3DES",
  };
  const ipekClaro = dukptServer
    .dukptDecrypt(input.ipekCifrada, optionsDukpt)
    .toUpperCase();

  console.log("-> IPEK Descifrada (en claro):", ipekClaro);

  // PASO 2: Cifrar para Storage usando métodos internos
  const padded = getBuggyPaddedUdid(input.udid);
  const resBdk = tripleDesLibrary(input.bdk, padded);
  const resKsn = tripleDesLibrary(input.ksn.substring(0, 16), padded);
  const resIpekStorage = tripleDesLibrary(ipekClaro, padded);

  // PASO 3: Generar y Cifrar PIN Block
  const resPinBlock = generatePinBlock(input.pin, input.docNum, input.docType);

  let finalKsn = input.ksn.substring(0, input.ksn.length - 4);
  finalKsn = (
    finalKsn + input.account.substring(input.account.length - 4)
  ).toUpperCase();

  const dukptFinal = new Dukpt(input.bdk, finalKsn);
  dukptFinal._deriveDukptSessionKeyForPinBlock(ipekClaro);
  const resFinalBlock = dukptFinal
    .dukptEncrypt(resPinBlock, {
      inputEncoding: "hex",
      outputEncoding: "hex",
      encryptionMode: "3DES",
      forPinBlock: true,
    })
    .toUpperCase();

  const results = [
    {
      Concepto: "BDK Encriptada",
      Resultado: resBdk,
      Esperado: expected.encBdk,
      Estado: resBdk === expected.encBdk ? "✅ OK" : "❌ FAIL",
    },
    {
      Concepto: "KSN Encriptada",
      Resultado: resKsn,
      Esperado: expected.encKsn,
      Estado: resKsn === expected.encKsn ? "✅ OK" : "❌ FAIL",
    },
    {
      Concepto: "IPEK Storage",
      Resultado: resIpekStorage,
      Esperado: expected.encIpekStorage,
      Estado: resIpekStorage === expected.encIpekStorage ? "✅ OK" : "❌ FAIL",
    },
    {
      Concepto: "PIN Block",
      Resultado: resPinBlock,
      Esperado: expected.pinBlock,
      Estado: resPinBlock === expected.pinBlock ? "✅ OK" : "❌ FAIL",
    },
    {
      Concepto: "Criptograma PIN",
      Resultado: resFinalBlock,
      Esperado: expected.cipherPinBlock,
      Estado: resFinalBlock === expected.cipherPinBlock ? "✅ OK" : "❌ FAIL",
    },
  ];

  console.table(results);

  const allPassed = results.every((r) => r.Estado === "✅ OK");
  console.log("\n¿LOGRADO?: " + (allPassed ? "SÍ ✅" : "NO ❌"));
}

runTest();

// ========================================================
// Llave BDK = E19F787D8765551866184D59A0C35A8E
// Llave KSN = a71882df9cE00000
// Llave IPEK = 5F6535F756E80F561A593E34DF2E0A5B
// IPEK CHECK DIGITS = 2E2686
// ========================================================

// ========================================================
// PIN / OTP = 839732
// ========================================================

// ========================================================
// TIPO DOC = 1
// NUM DOC = 20686722
// udid = a71882df9cd22f06
// ID CUENTA = efe138ae
// ========================================================

// ========================================================
// Resultados esperados:
// Llave BDK encriptada = 1B6389F780D0D681A6FE24EA5F09D524
// Llave KSN encriptada = 4C40145828C3AB60
// Llave IPEK encriptada = 28D3C0145374EE8DEAE33BCA46B8138E
// PIN Block generado (hex): 06839632DF9798DD
// PIN Block cifrado con DUKPT (hex): A035F329C39C7D50
// ========================================================
