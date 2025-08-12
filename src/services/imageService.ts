// Image Service for EG Retail Product Images

export interface ProductImageConfig {
  baseUrl: string;
  fallbackUrl?: string;
}

class ProductImageService {
  private config: ProductImageConfig = {
    baseUrl: 'https://lrsdemoprod.blob.core.windows.net/images',
    fallbackUrl: undefined // Optional fallback image
  };

  // Configure the image service
  configure(config: Partial<ProductImageConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Get image URL for a product by GTIN
  getImageUrl(gtin: string): string {
    if (!gtin || !this.isValidGtin(gtin)) {
      return this.config.fallbackUrl || '';
    }
    
    return `${this.config.baseUrl}/${gtin}.jpg`;
  }

  // Get multiple image URLs (for different sizes if needed)
  getImageUrls(gtin: string): string[] {
    const imageUrl = this.getImageUrl(gtin);
    return imageUrl ? [imageUrl] : [];
  }

  // Check if image exists (returns a promise that resolves with boolean)
  async checkImageExists(gtin: string): Promise<boolean> {
    const imageUrl = this.getImageUrl(gtin);
    if (!imageUrl) return false;

    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.log(`🖼️ Image not available for GTIN ${gtin}:`, error);
      return false;
    }
  }

  // Get image URL with existence check
  async getVerifiedImageUrl(gtin: string): Promise<string | null> {
    const imageUrl = this.getImageUrl(gtin);
    if (!imageUrl) return null;

    const exists = await this.checkImageExists(gtin);
    return exists ? imageUrl : null;
  }

  // Validate GTIN format (basic validation)
  private isValidGtin(gtin: string): boolean {
    // Check if it's a valid GTIN format (8, 12, 13, or 14 digits)
    return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin);
  }

  // Preload image (useful for better UX)
  preloadImage(gtin: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const imageUrl = this.getImageUrl(gtin);
      if (!imageUrl) {
        reject(new Error('No image URL available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log(`✅ Preloaded image for GTIN ${gtin}`);
        resolve();
      };
      img.onerror = () => {
        console.log(`❌ Failed to preload image for GTIN ${gtin}`);
        reject(new Error('Failed to load image'));
      };
      img.src = imageUrl;
    });
  }

  // Get configuration
  getConfig(): ProductImageConfig {
    return { ...this.config };
  }
}

export const productImageService = new ProductImageService();
