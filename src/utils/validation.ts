export const validateBirthYear = (value: string): string => {
    const currentYear = new Date().getFullYear();
    const year = parseInt(value,10);

    if(!/^\d{4}$/.test(value)){
        return '4자리 숫자로 입력해주세요.'
    }

    if(year < 1900 || year > currentYear) {
        return `${1900} ~ ${currentYear} 사이로 입력해주세요.`;
    }

    return '';
};