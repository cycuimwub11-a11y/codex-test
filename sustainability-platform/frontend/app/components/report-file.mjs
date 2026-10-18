/** @param {{ name: string, size: number }} file @param {boolean} spreadsheet */
export function reportFileError(file, spreadsheet = false) {
  const format = spreadsheet ? "CSV 或 XLSX" : "PDF";
  const maxMb = spreadsheet ? 25 : 10;
  if (file.size > maxMb * 1024 * 1024) return `檔案超過 ${maxMb} MB，請選擇較小的 ${format} 檔案。`;
  if (!(spreadsheet ? /\.(csv|xlsx)$/i : /\.pdf$/i).test(file.name) || file.size === 0) return `請選擇有內容的 ${format} 檔案。`;
  return "";
}

/** @param {Uint8Array} bytes */
export function hasPdfSignature(bytes) {
  // Identifies the file type only. This does not parse or verify a report.
  return new TextDecoder().decode(bytes.subarray(0, 8)).startsWith("%PDF-");
}

/** @param {string} name @param {Uint8Array} bytes */
export function spreadsheetContentError(name, bytes) {
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  // ponytail: ZIP header / text checks only, validate workbook tables when the parser is connected.
  if (/\.xlsx$/i.test(name)) return isZip ? "" : "這份檔案不像 XLSX，請從試算表軟體重新匯出 .xlsx 檔案。";
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
  if (hasPdfSignature(bytes) || isZip || new TextDecoder(encoding).decode(bytes).includes("\0")) return "這份檔案不像 CSV 文字檔，請從試算表軟體重新匯出 .csv 檔案。";
  return "";
}
