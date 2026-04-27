import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendChallengeInviteParams {
  to: string;
  fromEmail: string;
  challengeId: string;
  inviteToken: string;
}

export async function sendChallengeInvite({
  to,
  fromEmail,
  challengeId,
  inviteToken,
}: SendChallengeInviteParams): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/challenge/${challengeId}?token=${inviteToken}`;

  await resend.emails.send({
    from: "WordHunt <noreply@wordhunt.app>",
    to,
    subject: `${fromEmail} challenged you to today's WordHunt!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h1 style="font-size:28px;margin-bottom:8px;">You've been challenged! 🎯</h1>
        <p style="color:#555;font-size:16px;">
          <strong>${fromEmail}</strong> wants to see how you do on today's WordHunt.
        </p>
        <p style="color:#555;font-size:16px;">
          Accept the challenge to play head-to-head. The game won't start for either of you until you accept.
        </p>
        <a href="${inviteUrl}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
          Accept Challenge
        </a>
        <p style="margin-top:24px;color:#999;font-size:13px;">
          This invite expires in 24 hours. You can also decline and play today's word solo anytime.
        </p>
      </div>
    `,
  });
}
