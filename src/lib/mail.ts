import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NivasaHQ <onboarding@resend.dev>', // Use resend.dev for testing unless you have a verified domain
      to: email,
      subject: 'Verify your email address - NivasaHQ',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
            <h1 style="color: #0f172a; margin-bottom: 20px;">Welcome to NivasaHQ!</h1>
            <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">
              Please use the following 6-digit verification code to complete your registration. This code will expire in 10 minutes.
            </p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d4a853; margin-bottom: 30px;">
              ${token}
            </div>
            <p style="color: #94a3b8; font-size: 14px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      
      // In development, if Resend fails (e.g. unverified domain sandbox limits), just log the token and pretend it succeeded.
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n==============================================`);
        console.log(`[DEV MODE] MOCKED EMAIL TO: ${email}`);
        console.log(`[DEV MODE] VERIFICATION TOKEN: ${token}`);
        console.log(`==============================================\n`);
        return { success: true, data: { id: 'mock-id' } };
      }

      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n==============================================`);
      console.log(`[DEV MODE] MOCKED EMAIL TO: ${email}`);
      console.log(`[DEV MODE] VERIFICATION TOKEN: ${token}`);
      console.log(`==============================================\n`);
      return { success: true, data: { id: 'mock-id' } };
    }

    return { success: false, error: "Failed to send verification email" };
  }
}
