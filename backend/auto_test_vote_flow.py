import requests

BASE = "http://127.0.0.1:8000"


def main():
    login = {"email": "kevin@test.com", "password": "@Kevin"}
    r = requests.post(f"{BASE}/api/auth/login", json=login)
    print("LOGIN", r.status_code, r.text)
    if r.status_code != 200:
        return
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # create a report to vote on
    report = {
      "title": "Test vote pothole",
      "description": "Test vote flow",
      "issue_type": "pothole",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "address": "MG Road"
    }

    r2 = requests.post(f"{BASE}/api/reports/", json=report, headers=headers)
    print("CREATE REPORT", r2.status_code, r2.text)
    if r2.status_code != 201:
        return
    rid = r2.json().get("id")

    r3 = requests.post(f"{BASE}/api/votes/{rid}", headers=headers)
    print("VOTE", r3.status_code, r3.text)


if __name__ == '__main__':
    main()
