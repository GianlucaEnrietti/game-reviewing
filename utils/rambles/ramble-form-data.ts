import { MAX_COVER_BYTES } from "../storage/upload-cover";

export { MAX_COVER_BYTES };

export function parseRambleFormData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();
  const cover = formData.get("cover");

  return { title, subtitle, excerpt, slugInput, content, coverAlt, cover };
}

export function validateRambleFields(
  fields: ReturnType<typeof parseRambleFormData>,
  slug: string
): string | null {
  if (!fields.title) {
    return "El título es obligatorio.";
  }

  if (!slug) {
    return "No se pudo generar un slug válido.";
  }

  if (!fields.excerpt) {
    return "El extracto es obligatorio.";
  }

  if (!fields.content) {
    return "El contenido es obligatorio.";
  }

  return null;
}
