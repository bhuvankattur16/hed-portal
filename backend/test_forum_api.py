import requests
import json
from datetime import datetime

API_URL = "http://localhost:8000/api/forum/messages"

def test_forum_api():
    print("Testing POST /api/forum/messages...")
    test_message = {
        "user": "TestUser",
        "text": f"Verification test at {datetime.now().strftime('%H:%M:%S')}",
        "time": "Just now"
    }
    
    post_res = requests.post(API_URL, json=test_message)
    print(f"POST Status: {post_res.status_code}")
    print(f"POST Response: {post_res.json()}")
    
    if post_res.status_code == 200:
        print("\nTesting GET /api/forum/messages...")
        get_res = requests.get(API_URL)
        print(f"GET Status: {get_res.status_code}")
        messages = get_res.json().get("messages", [])
        print(f"Total messages: {len(messages)}")
        
        # Check if our test message is in the list
        found = any(m["user"] == "TestUser" and m["text"] == test_message["text"] for m in messages)
        if found:
            print("SUCCESS: Test message found in retrieval list!")
        else:
            print("FAILURE: Test message not found in retrieval list.")
    else:
        print("FAILURE: Could not post test message.")

if __name__ == "__main__":
    test_forum_api()
