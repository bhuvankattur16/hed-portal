import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from core.config import settings

def send_share_invitation(to_email: str, doc_title: str, share_link: str, sender_name: str) -> bool:
    """Sends a real email invitation for a document."""
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        print("SMTP credentials missing.")
        return False

    subject = f"Invitation to review: {doc_title}"
    body = f"""Hello,

{sender_name} has invited you to review a document on the HED Retrieval System.

Document: {doc_title}
Access Link: {share_link}

Regards,
HED System"""

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"SMTP SSL failed: {e}. Trying STARTTLS...")
        try:
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e2:
            print(f"Email service error: {e2}")
            return False
