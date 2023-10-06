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
