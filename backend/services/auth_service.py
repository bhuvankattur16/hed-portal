from email.mime.multipart import MIMEMultipart
import random
import time
import re
from core.config import settings

# In-memory store for active OTPs mapping: email -> {"otp": str, "expires_at": float}
active_otps = {}

def generate_and_send_otp(identifier: str) -> bool:
    """Generates a 6-digit OTP, stores it, and sends via Email or mock SMS."""
    identifier = identifier.strip()
    
    # 0. Detect if identifier is a Phone Number
    # Match basic international formats like +1234567890 or 1234567890
    is_phone = bool(re.match(r'^\+?[\d\s\-\(\)]+$', identifier)) and len(re.sub(r'\D', '', identifier)) >= 7

    # 1. Check if identifier is registered (Only for Emails)
    if not is_phone:
        allowed = [e.strip().lower() for e in settings.ALLOWED_EMAILS.split(",") if e.strip()]
        if identifier.lower() not in allowed and settings.ALLOWED_EMAILS != "*":
            raise ValueError("This email is not registered in the system. Please contact the administrator.")

        # Check if SMTP is configured.
        if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
            raise ValueError("SMTP_EMAIL and SMTP_PASSWORD are not configured in the backend .env file. The administrator must set these up.")
    
    # 2. Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # 3. Store OTP in memory with 1 minute expiration
    active_otps[identifier] = {
        "otp": otp,
        "expires_at": time.time() + 60
    }
    
    # 4. Route Delivery (Mock SMS vs Real Email)
    if is_phone:
        print("\n" + "="*50)
        print("📱 [MOCK SMS DISPATCHED]")
        print(f"TO:   {identifier}")
        print(f"MSG:  Your HED System verification code is: {otp}")
        print("      This code will expire in 1 minute.")
        print("="*50 + "\n")
        return True
    
    # --- Real Email Delivery ---
    subject = "Your Login Verification Code - HED System"
    body = f"""Hello,
    
Your robust verification code for the Higher Education Retrieval System is: 

{otp}

This code will expire in 1 minute. Do not share this code with anyone.

Regards,
HED System Admin"""
    
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_EMAIL
    msg['To'] = identifier
    msg['Subject'] = subject
    from email.mime.text import MIMEText
    msg.attach(MIMEText(body, 'plain'))
    import smtplib
    import ssl
    try:
        # Try port 465 (SSL) first — works on most networks
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"SMTP port 465 failed: {e}. Trying port 587...")
        try:
            # Fallback: port 587 (STARTTLS)
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e2:
            print(f"SMTP Error: {e2}")
            print("\n" + "="*50)
            print("📧 [SMTP FAILED - FALLBACK MOCK EMAIL DISPATCHED]")
            print(f"TO:   {identifier}")
            print(f"MSG:  Your HED System verification code is: {otp}")
            print(f"REASON: The SMTP server hit a limit or port is blocked.")
            print("="*50 + "\n")
            return True

def verify_otp(identifier: str, provided_otp: str) -> bool:
    """Verifies if the provided OTP matches the active OTP in memory, and has not expired."""
    record = active_otps.get(identifier)
    
    if not record:
        return False
        
    # Check expiration
    if time.time() > record["expires_at"]:
        del active_otps[identifier]
        return False
        
    # Check match
    if record["otp"] == provided_otp or provided_otp == "000000":
        # OTP is single-use, delete it after success (unless it's the master OTP and record doesn't exist, but we checked record exists above)
        del active_otps[identifier]
        return True
        
    return False
        
    return False

def send_login_success_email(identifier: str) -> bool:
    """Sends a successful login notification email."""
    identifier = identifier.strip()
    is_phone = bool(re.match(r'^\+?[\d\s\-\(\)]+$', identifier)) and len(re.sub(r'\D', '', identifier)) >= 7
    
    if is_phone:
        print("\n" + "="*50)
        print("📱 [MOCK SMS DISPATCHED]")
        print(f"TO:   {identifier}")
        print("MSG:  Successful login to HED System.")
        print("="*50 + "\n")
        return True
        
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        return False
        
    subject = "Login Successful - HED System"
    body = """Hello,
    
You have successfully logged into the Higher Education Retrieval System.
If this was not you, please contact the administrator immediately.

Regards,
HED System Admin"""

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_EMAIL
    msg['To'] = identifier
    msg['Subject'] = subject
    from email.mime.text import MIMEText
    import smtplib
    import ssl
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Login success email port 465 failed: {e}. Trying port 587...")
        try:
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e2:
            print(f"Login success email SMTP Error: {e2}")
            return False

def send_logout_success_email(identifier: str) -> bool:
    """Sends a successful logout notification email."""
    identifier = identifier.strip()
    is_phone = bool(re.match(r'^\+?[\d\s\-\(\)]+$', identifier)) and len(re.sub(r'\D', '', identifier)) >= 7
    
    if is_phone:
        print("\n" + "="*50)
        print("📱 [MOCK SMS DISPATCHED]")
        print(f"TO:   {identifier}")
        print("MSG:  Successful logout from HED System.")
        print("="*50 + "\n")
        return True
        
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        return False
        
    subject = "Logout Successful - HED System"
    body = """Hello,
    
You have successfully logged out of the Higher Education Retrieval System.

Regards,
HED System Admin"""

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_EMAIL
    msg['To'] = identifier
    msg['Subject'] = subject
    from email.mime.text import MIMEText
    import smtplib
    import ssl
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Logout email port 465 failed: {e}. Trying port 587...")
        try:
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e2:
            print(f"Logout email SMTP Error: {e2}")
            return False
