import API_BASE_URL from "../components/Config";

/**
 * Resolves the image URL.
 * If the path is absolute (starts with http), returns it as is.
 * If the path is relative, prepends the API_BASE_URL.
 * If path is null/undefined, returns null (caller should handle placeholder).
 * 
 * @param {string} path - The image path from the backend
 * @returns {string|null} - The resolved full URL
 */
export const getImageUrl = (input) => {
    if (!input) return null;

    let path = input;
    // Handle array input (e.g. from multer file arrays stored directly)
    if (Array.isArray(input)) {
        if (input.length === 0) return null;
        path = input[0];
    }

    if (typeof path !== 'string') return null;

    if (path.startsWith('http') || path.startsWith('https')) {
        return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanPath}`;
};
