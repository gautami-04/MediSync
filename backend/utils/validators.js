const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const isStrongPassword = (password) => PASSWORD_REGEX.test(String(password || ''));

const getPasswordRequirementsMessage = () =>
	'Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.';

module.exports = {
	isStrongPassword,
	getPasswordRequirementsMessage,
};
