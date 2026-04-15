let Dukpt = require("@atmira/dukpt3des");

generatePinBlock = (pin, pan, docType) => {
  var block1 = "0" + (pin + "").length + pin;
  console.log("Paso 1: construccion bloque1 (0 + pin.length + pin): ", block1);
  var block2 = pan + "";
  console.log("Paso 2: construccion bloque2 (doc number): ", block2);
  while (block1.length < 16) {
    block1 = block1 + "F";
  }
  console.log(
    "Paso 3: llenado con F a la derecha bloque1 hasta 16 caracteres: ",
    block1,
  );
  while (block2.length < 10) {
    block2 = "0" + block2;
  }
  console.log(
    "Paso 4: llenado  con 0 a la izquierda bloque2 hasta 10 caracteres: ",
    block2,
  );

  block2 = docTypeSwitchTransform(docType + "") + "" + block2;
  console.log("Paso 5: agregar tipo de doc a bloque2: ", block2);

  while (block2.length < 16) {
    block2 = "0" + block2;
  }
  console.log(
    "Paso 6: llenado  con 0 a la izquierda bloque2 hasta 16 caracteres: ",
    block2,
  );

  function hexstringToData(hexString) {
    var hex = hexString;
    hex = hex.replace(/\s/g, "");
    var keyar = hex.match(/../g);
    var s = "";
    for (var i = 0; i < keyar.length; i++) {
      s += String.fromCharCode(Number("0x" + keyar[i]));
    }
    return s;
  }
  function dataToHexstring(data) {
    var hex = "";
    for (var i = 0; i < data.length; i++) {
      var h = data.charCodeAt(i).toString(16);
      if (h.length < 2) h = "0" + h;
      hex += h;
    }
    return hex.toUpperCase();
  }
  var data1 = hexstringToData(block1);
  console.log("Paso 7: convertir bloque1 de hexa a ASCII: ", data1);

  var data2 = hexstringToData(block2);
  console.log("Paso 8: convertir bloque2 de hexa a ASCII: ", data2);

  var output = "";
  if (data1.length < data2.length) {
    while (data1.length < data2.length) {
      data1 = "\0" + data1;
    }
  }
  if (data1.length > data2.length) {
    while (data1.length > data2.length) {
      data2 = "\0" + data2;
    }
  }
  console.log(
    "Paso 9: iguala las longitudes agregando bytes nulos a la izquierda si es necesario",
  );
  for (var i = 0; i < data1.length; i++) {
    var result = data1.charCodeAt(i) ^ data2.charCodeAt(i);
    output += String.fromCharCode(result);
  }
  console.log("Paso 10: Realiza XOR de bloque1 con bloque 2 ", output);
  var outputHexa = dataToHexstring(output);

  console.log("Paso 11: Convierte el resultado a hexadecimal", outputHexa);
  return outputHexa;
};

encryptForPinBlock = (plain, account) => {
  console.log("INICIA ENCRIPTADO DE PINBLOCK");
  let options = {
    inputEncoding: "hex",
    outputEncoding: "hex",
    encryptionMode: "3DES",
    forPinBlock: true,
  };
  var encrypted = "";
  console.log("Paso 12: Desencripta BDK almacenado en local storage ", bdkData);
  var encryptionBDK = decryptForKey(bdkData);

  console.log("Paso 13: Desencripta KSN almacenado en local storage ", ksnData);
  var ksn = decryptForKey(ksnData);

  ksn = ksn.substring(0, ksn.length - 4);
  console.log("Paso 14: Remover ultimos 4 de KSN: ", ksn);

  ksn = ksn + account.substring(account.length - 4, account.length);
  console.log(
    "Paso 15: Agregar ultimos 4 de cuenta seleccionada, al final de KSN: ",
    ksn,
  );
  //ksn =ksn + 'ABCD';

  //ksn = '5555544444E01234';
  ksn = ksn.toUpperCase();
  console.log(
    "Paso 16: Desencripta IPEK almacenado en local storage ",
    ipekData,
  );
  var ipek = decryptForKey(ipekData);

  var dukpt = new Dukpt(encryptionBDK, ksn);
  console.log("Paso 17: Inicializa el motor DUKPT con la BDK y el KSN");
  dukpt._deriveDukptSessionKeyForPinBlock(ipek);
  console.log(
    "Paso 18: Deriva la clave de sesión DUKPT para el cifrado del PIN Block",
  );
  encrypted = dukpt.dukptEncrypt(plain, options);

  console.log(
    "Paso 19: Cifra el dato usando la clave de sesión DUKPT Resultado: ",
    encrypted,
  );
  return encrypted;
};

function decryptForKey(plain) {
  console.log("Inicia decrypt for key: ", plain);
  let options = {
    inputEncoding: "hex",
    outputEncoding: "hex",
    decryptionMode: "3DES",
  };

  var encryptionBDK = "11111111111111111111111111111111";

  var udid = "4a7f2c096c6f25fb"; // eslint-disable-line
  console.log("* Toma el udid del dispositivo: ", udid);

  if (udid.length > encryptionBDK.length) {
    udid = udid.substring(0, encryptionBDK.length);
  } else if (udid.length < encryptionBDK.length) {
    for (let i = 0; i < encryptionBDK.length - udid.length; i++) {
      udid = "0" + udid;
    }
  }
  console.log(
    "* Completa con 0 a la izquierda el udid hasta 32 caracteres ",
    udid,
  );

  encryptionBDK = udid;
  console.log("* El udid se usa como BDK ", udid);

  var ksn = "9876543210E00000";

  var decrypted = "";
  var dukpt = new Dukpt(encryptionBDK, ksn);
  console.log("* Inicializa el motor DUKPT con la BDK y el KSN");

  decrypted = dukpt.dukptDecrypt(plain, options);
  console.log(
    "* Descifra el dato usando la clave DUKPT correspondiente, resultado: ",
    decrypted,
  );
  return decrypted;
}

docTypeSwitchTransform = (docType) => {
  switch (docType) {
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
  }
};

const bdkData = "04BD110A62E05F9C354266F6DC065C23";
const ksnData = "2F9F5985A66B51FA";
const ipekData = "BA7CB9A4474682C0A5C5FD109F0609B3";
const pin = "029550";
const docNum = "1026590349";
const idCuenta = "8400f9e9";
const docType = "1";
var pinblock = generatePinBlock(pin, docNum, docType);
console.log("PIN BLOCK :", pinblock);
console.log("ENCRYPTION FOR PINBLOCK", encryptForPinBlock(pinblock, idCuenta));
