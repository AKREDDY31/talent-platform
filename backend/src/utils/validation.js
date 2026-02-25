const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

export const isValidEmail = (email = "") => EMAIL_REGEX.test(String(email).trim());

export const isValidPassword = (password = "") => {
  // At least 8 chars with upper, lower, number, and special char.
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/.test(password);
};

export const isValidGithubUrl = (url = "") => GITHUB_REGEX.test(String(url).trim());

export const toSafeString = (value, max = 500) => String(value || "").trim().slice(0, max);

export const toNullableString = (value, max = 500) => {
  const trimmed = toSafeString(value, max);
  return trimmed ? trimmed : null;
};

export const toNullableInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};
