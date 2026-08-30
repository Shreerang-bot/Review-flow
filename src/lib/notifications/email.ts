import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface FeedbackEmailData {
  businessName: string;
  toEmail: string;
  rating: number;
  tags: string[];
  feedback?: string;
  submittedAt: string;
}

export async function sendFeedbackNotification(data: FeedbackEmailData) {
  const { businessName, toEmail, rating, tags, feedback, submittedAt } = data;

  const tagsList = tags.length > 0
    ? tags.map(t => `<li style="margin: 4px 0; color: #DC2626;">${t}</li>`).join('')
    : '<li style="color: #9CA3AF;">No specific areas selected</li>';

  const feedbackSection = feedback
    ? `
      <div style="margin-top: 16px; padding: 16px; background: #FEF2F2; border-radius: 8px; border-left: 4px solid #DC2626;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827; font-size: 14px;">Customer Feedback:</p>
        <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">${feedback}</p>
      </div>`
    : '';

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 24px; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); text-align: center;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700;">ReviewFlow AI</h1>
            <p style="margin: 8px 0 0 0; color: #C7D2FE; font-size: 14px;">New Private Feedback Received</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px 0; color: #111827; font-size: 15px;">
              A customer has submitted private feedback for <strong>${businessName}</strong>.
            </p>
            
            <!-- Rating -->
            <div style="margin: 16px 0; padding: 16px; background: #F9FAFB; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #9CA3AF;">Rating</p>
              <p style="margin: 0; font-size: 28px; color: ${rating <= 2 ? '#DC2626' : '#F59E0B'};">${stars}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #4B5563;">${rating} out of 5 stars</p>
            </div>
            
            <!-- Areas of Concern -->
            <div style="margin-top: 16px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827; font-size: 14px;">Areas of Concern:</p>
              <ul style="margin: 0; padding: 0 0 0 20px; list-style-type: disc;">
                ${tagsList}
              </ul>
            </div>
            
            ${feedbackSection}
            
            <!-- Timestamp -->
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                Submitted on ${submittedAt}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 16px 24px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
              This notification was sent by ReviewFlow AI. 
              <a href="#" style="color: #4F46E5; text-decoration: none;">Manage settings</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResendClient().emails.send({
      from: 'ReviewFlow AI <notifications@reviewflow.ai>',
      to: toEmail,
      subject: `⚠️ Private Feedback (${rating}★) - ${businessName}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return { success: false, error };
  }
}
