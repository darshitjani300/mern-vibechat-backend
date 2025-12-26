export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponseBody {
  message: string;
  data?: {
    userId: string;
    email: string;
    username: string;
  };
  error?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponseBody {
  message: string;
  data?: {
    userId: string;
    email: string;
  };
  error?: string;
}

export interface ForgetRequestBody {
  email: string;
}

export interface ForgetResponseBody {
  message: string;
}

export interface ResetRequestBody {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ResetResponseBody {
  message: string;
}
