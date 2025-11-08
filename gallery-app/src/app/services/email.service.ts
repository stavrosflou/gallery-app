import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Web3Forms response interface
interface Web3FormsResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Web3Forms configuration
  // Get your free access key from: https://web3forms.com/
  // IMPORTANT: Replace this with your actual Web3Forms access key
  private readonly WEB3FORMS_ACCESS_KEY = '1299e8b3-be03-4992-89d0-e555459aae62';
  private readonly WEB3FORMS_API_URL = 'https://api.web3forms.com/submit';

  constructor(private http: HttpClient) {}

  async sendEmail(
    formData: { name: string; email: string; phone: string; message: string },
    paintingInfo?: { title: string; artist: string; id: number }
  ): Promise<boolean> {
    try {
      // Build the complete message including painting info
      let fullMessage = formData.message;
      
      if (paintingInfo) {
        fullMessage = `Painting \n\nPainting: ${paintingInfo.title}\nArtist: ${paintingInfo.artist}\nPainting ID: ${paintingInfo.id}\n\n${formData.message}`;
      }

      // Prepare form data for Web3Forms
      const payload = {
        access_key: this.WEB3FORMS_ACCESS_KEY,
        name: formData.name,
        email: formData.email,
        message: fullMessage,
        subject: paintingInfo 
          ? `Gallery: ${paintingInfo.title}` 
          : 'New Gallery Contact Form Submission',
        'Custom Field - Phone': formData.phone
      };

      // Send to Web3Forms API
      const response = await firstValueFrom(
        this.http.post<Web3FormsResponse>(this.WEB3FORMS_API_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );

      return response.success;

    } catch (error) {
      throw error;
    }
  }
}