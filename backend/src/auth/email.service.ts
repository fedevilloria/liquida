import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  private readonly sender: string;

  private readonly frontendUrl: string;

  private readonly expirationHours: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('SMTP_HOST');
    const port = this.configService.getOrThrow<number>('SMTP_PORT');
    const secure = this.configService.getOrThrow<boolean>('SMTP_SECURE');
    const user = this.configService.getOrThrow<string>('SMTP_USER');
    const password = this.configService.getOrThrow<string>('SMTP_PASSWORD');

    this.sender = this.configService.getOrThrow<string>('SMTP_FROM');
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    this.expirationHours = this.configService.getOrThrow<number>(
      'EMAIL_VERIFICATION_EXPIRES_HOURS',
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });
  }

  /**
   * Comprueba que las credenciales SMTP y la conexión
   * con el servidor de correo sean válidas.
   */
  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }

  /**
   * Envía el enlace utilizado para verificar el correo.
   */
  async sendEmailVerification(
    recipient: string,
    userName: string,
    plainToken: string,
  ): Promise<void> {
    const verificationUrl =
      `${this.frontendUrl}/verify-email?token=` +
      encodeURIComponent(plainToken);

    const safeName = this.escapeHtml(userName);

    await this.transporter.sendMail({
      from: this.sender,
      to: recipient,
      subject: 'Verificá tu correo en Liquida',
      text: [
        `Hola ${userName},`,
        '',
        'Recibimos una solicitud para registrar tu cuenta en Liquida.',
        'Verificá tu correo ingresando al siguiente enlace:',
        '',
        verificationUrl,
        '',
        `Este enlace vence en ${this.expirationHours} horas.`,
        'Si no solicitaste esta cuenta, podés ignorar este mensaje.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.6;">
          <h1 style="color: #15946f;">Liquida</h1>

          <p>Hola ${safeName},</p>

          <p>
            Recibimos una solicitud para registrar tu cuenta en Liquida.
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                border-radius: 8px;
                background-color: #15946f;
                color: #ffffff;
                font-weight: 700;
                text-decoration: none;
              "
            >
              Verificar mi correo
            </a>
          </p>

          <p>Este enlace vence en ${this.expirationHours} horas.</p>

          <p style="color: #667085; font-size: 14px;">
            Si no solicitaste esta cuenta, podés ignorar este mensaje.
          </p>
        </div>
      `,
    });
  }

  /**
   * Escapa caracteres que podrían interpretarse como HTML.
   */
  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
