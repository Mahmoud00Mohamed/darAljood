// خدمة المصادقة للوحة التحكم
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  expiresIn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class AuthService {
  private baseUrl = "https://server-algood.onrender.com/api/auth";
  // https://server-algood.onrender.com
  private tokenKey = "admin_token";

  /**
   * تسجيل دخول المدير
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: ApiResponse<AuthResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.message || "فشل في تسجيل الدخول");
      }

      // حفظ الرمز في localStorage
      this.setToken(result.data.token);

      return result.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الدخول"
      );
    }
  }

  /**
   * التحقق من صحة الجلسة
   */
  async verifySession(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Session verification error:", error);
      return false;
    }
  }

  /**
   * تسجيل خروج المدير
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.removeToken();
    }
  }

  /**
   * حفظ الرمز في localStorage
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  /**
   * الحصول على الرمز من localStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * حذف الرمز من localStorage
   */
  removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  /**
   * التحقق من وجود رمز صحيح
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
