// Token validation utility for JWT tokens

export interface TokenInfo {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  timeUntilExpiry?: string;
  payload?: any;
  error?: string;
}

export class TokenValidator {
  /**
   * Decode and validate a JWT token
   */
  static validateToken(token: string): TokenInfo {
    try {
      if (!token || typeof token !== 'string') {
        return {
          isValid: false,
          isExpired: true,
          error: 'Invalid token format'
        };
      }

      // Split JWT token (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          isExpired: true,
          error: 'Invalid JWT format'
        };
      }

      // Decode payload (base64url)
      const payload = this.base64UrlDecode(parts[1]);
      const parsedPayload = JSON.parse(payload);

      // Check expiration
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const exp = parsedPayload.exp;

      if (!exp) {
        return {
          isValid: true,
          isExpired: false,
          payload: parsedPayload,
          error: 'No expiration time found in token'
        };
      }

      const isExpired = now >= exp;
      const expiresAt = new Date(exp * 1000);
      const timeUntilExpiry = isExpired ? 'EXPIRED' : this.formatTimeRemaining(exp - now);

      return {
        isValid: true,
        isExpired,
        expiresAt,
        timeUntilExpiry,
        payload: parsedPayload
      };

    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if stored tokens are valid and not expired
   */
  static checkStoredTokens(): {
    itemToken: TokenInfo;
    environment: string | null;
    needsRefresh: boolean;
  } {
    const itemToken = localStorage.getItem('item_bearer_token');
    const environment = localStorage.getItem('item_environment');

    const itemTokenInfo = itemToken ? this.validateToken(itemToken) : {
      isValid: false,
      isExpired: true,
      error: 'No token found'
    };

    const needsRefresh = itemTokenInfo.isExpired || !itemTokenInfo.isValid;

    return {
      itemToken: itemTokenInfo,
      environment,
      needsRefresh
    };
  }

  /**
   * Log token status with user-friendly messages
   */
  static logTokenStatus(): void {
    const status = this.checkStoredTokens();
    
    console.log('🔐 Token Status Check:');
    console.log(`📦 Environment: ${status.environment || 'Not set'}`);
    
    if (status.itemToken.isValid) {
      if (status.itemToken.isExpired) {
        console.log('❌ Item Token: EXPIRED');
        console.log(`⏰ Expired at: ${status.itemToken.expiresAt?.toLocaleString()}`);
      } else {
        console.log('✅ Item Token: Valid');
        console.log(`⏰ Expires in: ${status.itemToken.timeUntilExpiry}`);
        console.log(`📅 Expires at: ${status.itemToken.expiresAt?.toLocaleString()}`);
      }
    } else {
      console.log('❌ Item Token: Invalid');
      console.log(`🔍 Error: ${status.itemToken.error}`);
    }

    if (status.needsRefresh) {
      console.log('🔄 Action Required: Tokens need to be refreshed');
    }
  }

  /**
   * Set up automatic token expiration warnings
   */
  static setupTokenWarnings(): void {
    // Check immediately
    this.logTokenStatus();

    // Check every 5 minutes
    setInterval(() => {
      const status = this.checkStoredTokens();
      
      if (status.needsRefresh) {
        console.warn('⚠️ WARNING: Tokens have expired or are invalid. Please refresh tokens.');
        // You could also show a toast notification here
      } else if (status.itemToken.payload?.exp) {
        const timeLeft = status.itemToken.payload.exp - Math.floor(Date.now() / 1000);
        // Warn when less than 10 minutes remaining
        if (timeLeft < 600) {
          console.warn(`⚠️ WARNING: Token expires in ${this.formatTimeRemaining(timeLeft)}`);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Base64URL decode (JWT uses base64url encoding)
   */
  private static base64UrlDecode(str: string): string {
    // Add padding if necessary
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode
    return atob(str);
  }

  /**
   * Format seconds into human-readable time
   */
  private static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'EXPIRED';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
