const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "heic", "pdf"]);
const ALLOWED_MIMES = new Set(["image/png","image/jpeg","image/jpg","image/webp","image/gif","image/heic","application/pdf"]);
export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
export type ReceiptValidationCode = "empty" | "too_large" | "invalid_path" | "invalid_extension" | "invalid_mime";
export class ReceiptValidationException extends Error {
  readonly code: ReceiptValidationCode;
  constructor(message: string, code: ReceiptValidationCode) {
    super(message); this.name = "ReceiptValidationException"; this.code = code;
  }
}
function extensionOf(path: string): string {
  return path.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}
export function sanitizeReceiptPath(input: string | null | undefined): string | null {
  if (input == null || input.trim() === "") return null;
  const value = input.trim();
  if (value.length > 512 || value.startsWith("/") || value.startsWith("\\") || /^[a-zA-Z]:[\\/]/.test(value) || value.includes("\\") || value.split("/").some((segment) => segment === "..")) {
    throw new ReceiptValidationException("Caminho do comprovante inválido.", "invalid_path");
  }
  if (!ALLOWED_EXTENSIONS.has(extensionOf(value))) {
    throw new ReceiptValidationException("Extensão do comprovante não permitido.", "invalid_extension");
  }
  return value;
}
export function validateReceiptMetadata(path: string, metadata: { size: number | null | undefined; mime: string | null | undefined }): void {
  const safePath = sanitizeReceiptPath(path);
  if (!safePath) throw new ReceiptValidationException("Arquivo vazio ou caminho inválido.", "empty");
  if (!metadata.size || metadata.size <= 0) throw new ReceiptValidationException("O arquivo está vazio.", "empty");
  if (metadata.size > RECEIPT_MAX_BYTES) throw new ReceiptValidationException("O comprovante excede o limite de 10MB.", "too_large");
  const mime = metadata.mime?.trim().toLowerCase() ?? "";
  if (mime && !ALLOWED_MIMES.has(mime)) throw new ReceiptValidationException("Tipo MIME não permitido.", "invalid_mime");
  if (!mime && !ALLOWED_EXTENSIONS.has(extensionOf(safePath))) throw new ReceiptValidationException("Extensão não permitida.", "invalid_mime");
}
