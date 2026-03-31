import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api/auth"

def test_presence():
    test_email = f"tester_{int(time.time())}@example.com"
    
    print(f"1. Sending heartbeat for {test_email}...")
    res = requests.post(f"{BASE_URL}/heartbeat", json={"identifier": test_email})
    print(f"Status: {res.status_code}, Response: {res.json()}")
    
    if res.status_code == 200:
        print("\n2. Checking online users list...")
        res = requests.get(f"{BASE_URL}/online-users")
        users = res.json().get("users", [])
        print(f"Online users found: {len(users)}")
        
        if test_email in users:
            print(f"SUCCESS: {test_email} is online!")
        else:
            print(f"FAILURE: {test_email} not found in online list.")
    else:
        print("FAILURE: Could not send heartbeat.")

if __name__ == "__main__":
    test_presence()
