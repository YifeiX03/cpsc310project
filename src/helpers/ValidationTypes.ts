/*
 * Validation types
 * valid: boolean
 * error: string (optional)
 */
// this class is designed by shibo, but the ? after error is suggested by copilot
export interface ValidationResult {
	valid: boolean;
	error?: string;
}

export const mfields = new Set(["avg", "pass", "fail", "audit", "year"]);
export const sfields = new Set(["dept", "id", "instructor", "title", "uuid"]);

export const roomMfields = new Set(["lat", "lon", "seats"]);
export const roomSfields = new Set(["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"]);

export const applyToken = new Set(["MAX", "MIN" , "AVG" , "COUNT" , "SUM"]);
export const sortSeq = new Set(["UP", "DOWN"]);
