export const ok = (res, data, meta) => res.json({ data, ...(meta ? { meta } : {}) });
export const created = (res, data) => res.status(201).json({ data });
export const success = (data, meta) => ({ success: true, data, ...(meta ? { meta } : {}) });
export const error = (message, code) => ({ success: false, error: { message, ...(code ? { code } : {}) } });
