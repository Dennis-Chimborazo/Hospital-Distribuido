import nodemailer from "nodemailer";

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SECRET_EMAIL_SERVER, 
      auth: {
        user: process.env.SECRET_EMAIL_USER,
        pass: process.env.SECRET_EMAIL_PASS,
      },
    });
    this.from = process.env.SECRET_EMAIL_FROM ;
  }

  async enviarCorreoBienvenida(to, pass) {
    const subject = "Bienvenido al Hospital Nuevo Amanecer";

    const html = `
    <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        
        <div style="background-color:#2563eb; color:#ffffff; padding:16px; text-align:center;">
          <h2 style="margin:0;">Hospital Nuevo Amanecer</h2>
        </div>

        <div style="padding:24px; color:#333333;">
          <p style="font-size:16px;">🎉 Estimado/a,</p>
          <p style="font-size:15px; line-height:1.6;">
            Nos complace darte la bienvenida como nuevo integrante de nuestra institución. 
            Tu cuenta ha sido creada con éxito y estás a un paso de disfrutar todos los beneficios de nuestra plataforma.
          </p>

          <p style="font-size:15px; margin-top:20px; line-height:1.6;">
            🔐 Para garantizar la seguridad de tu información, te compartimos tu <strong>clave temporal:</strong>
          </p>
          <div style="text-align:center; margin:20px 0;">
            <span style="display:inline-block; background:#f3f4f6; border:1px solid #e5e7eb; padding:12px 20px; border-radius:6px; font-size:18px; font-weight:bold; color:#111827;">
              ${pass}
            </span>
          </div>
          </div>

          <p style="font-size:14px; color:#6b7280; line-height:1.6;">
            Si no solicitaste esta cuenta, ignora este mensaje. No se tomará ninguna acción sin tu confirmación.
          </p>
        </div>

        <div style="background:#f3f4f6; text-align:center; padding:12px; font-size:13px; color:#6b7280;">
          © ${new Date().getFullYear()} Hospital Nuevo Amanecer - Todos los derechos reservados.
        </div>
      </div>
    </div>
    `;

    const mailOptions = {
      from: this.from,
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, info };
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      return { success: false, error };
    }
  }
}
