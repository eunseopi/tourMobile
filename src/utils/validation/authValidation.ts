export const validateEmail = (email: string) => {
    if(!email.trim()) return '이메일을 입력해주세요.';
    if(!email.includes('@')) return '유효한 이메일 형식이 아닙니다.';
    
    return '';
};

export const validatePassword = (password: string) => {
    if (!password.trim()) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    return '';
};

export const validatePasswordConfirm = (pw: string, confirm: string) => {
    if (pw !== confirm) return '비밀번호가 일치하지 않습니다.';
    return '';
};

export const validateLoginForm = (email: string, password: string) => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const isValid = !emailError && !passwordError;
    return {
        isValid,
        errors: { email: emailError, password: passwordError },
    };
};

export const validSignupForm = () => {};