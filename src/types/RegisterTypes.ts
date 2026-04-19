export type Gender = 'male' | 'female' | '';

export interface RegisterState {
    // email step
    email: string;
    isEmailValid: boolean;
    isDuplicateChecked: boolean;
    showAuthInput: boolean;
    authCode: string;
    authPassed: boolean;
    emailError: string;
    authError: string;

    // gender step
    gender: Gender;
    birthYear: string;
    birthYearError?: string;

    // password step
    password: string;

    // profile setting step
    nickname: string;
    imageUrl: string;
    nicknameError: string;
    isNicknameDuplicatedChecked: boolean;
    isCheckingNickname: boolean;
    isRegisterMode: boolean;
    referralCode: string;
    referralError: string;

    // interests step
    themes: string[];

    // kakao
    kakaoCode?: string;
    kakaoEmail?: string;
    kakaoNickname?: string;
}

export type RegisterAction =
// email step
| { type: 'SET_EMAIL'; value: string }
| { type: 'VALIDATE_EMAIL' }
| { type: 'CHECK_DUPLICATE_SUCCESS' }
| { type: 'SHOW_AUTH_INPUT' }
| { type: 'SET_AUTH_CODE'; value: string }
| { type: 'AUTH_SUCCESS' }
| { type: 'SET_EMAIL_ERROR'; message: string }
| { type: 'SET_AUTH_ERROR'; message: string }

// gender step
| { type: 'SET_GENDER'; value: Gender }
| { type: 'SET_BIRTH_YEAR'; value: string }
| { type: 'SET_BIRTH_YEAR_ERROR'; message: string }

// password step
| { type: 'SET_PASSWORD'; value: string }

// profile setting step
| { type: 'SET_NICKNAME'; value: string }
| { type: 'SET_IMAGE_URL'; payload: string }
| { type: 'SET_NICKNAME_ERROR'; payload: string }
| { type: 'SET_CHECKING_NICKNAME'; payload: boolean }
| { type: 'SET_NICKNAME_DUPLICATE_CHECKED'; payload: boolean }
| { type: 'SET_REFERRAL_CODE'; payload: string }
| { type: 'SET_REFERRAL_ERROR'; payload: string }

// interest step
| { type: 'SET_THEMES'; payload: string[] }

// kakao
| { type: 'SET_KAKAO_CODE'; payload: string }
| { type: 'SET_KAKAO_EMAIL'; payload: string }
| { type: 'SET_KAKAO_NICKNAME'; payload: string }

| { type: 'RESET' };