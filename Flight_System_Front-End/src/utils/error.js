export function toUserMessage(err, fallback = "حدث خطأ، حاول مجدداً") {
  if (!err) return fallback;

  // axios error?
  if (err.response) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data?.message && typeof data.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(" • ");
    // NestJS أحياناً يرجّع message: array أو { message, error, statusCode }
    if (data?.error && typeof data.error === "string") return `${data.error}`;
    try { return JSON.stringify(data); } catch { return fallback; }
  }

  // plain Error
  if (err.message) return err.message;

  // string
  if (typeof err === "string") return err;

  try { return JSON.stringify(err); } catch { return fallback; }
}