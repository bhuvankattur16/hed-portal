import requests
import time
import sys

# Try both localhost and 127.0.0.1
HOSTS = ["http://127.0.0.1:8000", "http://localhost:8000"]

def test_logout_presence():
    test_email = f"logout_tester_{int(time.time())}@example.com"
    base_url = None
    
    print("0. Checking server availability...")
    for host in HOSTS:
        try:
            print(f"   Trying {host}...")
            res = requests.get(host + "/", timeout=5)
            if res.status_code == 200:
                print(f"   SUCCESS: Server responsive at {host}")
                base_url = host + "/api/auth"
                break
        except Exception as e:
            print(f"   Failed to connect to {host}: {e}")
    
    if not base_url:
        print("CRITICAL: Server is not responding on any host. Check if uvicorn is running.")
        sys.exit(1)

    try:
        print(f"1. Sending heartbeat for {test_email}...")
        res = requests.post(f"{base_url}/heartbeat", json={"identifier": test_email}, timeout=15)
        print(f"   Status: {res.status_code}, Response: {res.json()}")
        
        print("2. Confirming user is in online list...")
        res = requests.get(f"{base_url}/online-users", timeout=15)
        users = res.json().get("users", [])
        if test_email in users:
            print("   SUCCESS: User is online.")
        else:
            print(f"   FAILURE: User not found in online list. Online users: {users}")
            return

        print(f"3. Calling logout for {test_email}...")
        res = requests.post(f"{base_url}/logout", json={"email": test_email}, timeout=15)
        print(f"   Status: {res.status_code}, Response: {res.json()}")
        
        print("4. Verifying user is removed from online list...")
        res = requests.get(f"{base_url}/online-users", timeout=15)
        users = res.json().get("users", [])
        if test_email not in users:
            print("   SUCCESS: User was removed instantly!")
        else:
            print(f"   FAILURE: User is still in online list. Online users: {users}")
            
    except requests.exceptions.Timeout:
        print("   ERROR: Request timed out. Connectivity issue?")
    except Exception as e:
        print(f"   ERROR: {e}")

if __name__ == "__main__":
    test_logout_presence()
