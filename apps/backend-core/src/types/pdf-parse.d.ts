declare module 'pdf-parse' {
  type PdfParseResult = { text?: string };
  function pdf(data: Buffer | Uint8Array | ArrayBuffer): Promise<PdfParseResult>;
  export default pdf;
}
