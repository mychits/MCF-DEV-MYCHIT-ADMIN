export function numberToIndianWords(input) {
  const numString = String(input).trim();

  if (numString === '') {
    return "";
  }

  if (!/^-?\d+(\.\d+)?$/.test(numString)) {
    return "Invalid input: The input is not a valid number format.";
  }

  let prefix = "";
  let processedString = numString;
  if (numString.startsWith('-')) {
    prefix = "Minus ";
    processedString = numString.substring(1);
  }

  const parts = processedString.split('.');
  const integerPartString = parts[0];
  const decimalPartString = parts[1];

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function threeDigits(n) {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
  }

  function convertIntegerPart(str) {
    if (str === "0") return "Zero";

    let num = BigInt(str);

   
    if (num >= 1000000000n) {
      return "Too Large";
    }

 
    const placeValues = [
      { value: 10000000n, name: "Crore" },          
      { value: 100000n, name: "Lakh" },             
      { value: 1000n, name: "Thousand" },             
    ];

    let result = "";

    for (const place of placeValues) {
      if (num >= place.value) {
        const quotient = num / place.value;
        result += threeDigits(Number(quotient)) + " " + place.name + " ";
        num %= place.value;
      }
    }

    if (num > 0) {
      result += threeDigits(Number(num));
    }

    return result.trim();
  }

  const integerWords = convertIntegerPart(integerPartString);

  let decimalWords = "";
  if (decimalPartString) {
    const decimalDigits = decimalPartString.split('').map(digit => ones[parseInt(digit, 10)]);
    decimalWords = " Point " + decimalDigits.join(' ');
  }

  return prefix + integerWords + decimalWords;
}
