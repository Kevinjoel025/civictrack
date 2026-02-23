import requests, time

BASE = "http://127.0.0.1:8000"

# wait for server
for i in range(20):
    try:
        r = requests.get(f"{BASE}/docs", timeout=2)
        if r.status_code == 200:
            break
    except Exception:
        pass
    time.sleep(0.5)
else:
    print('server not ready')
    raise SystemExit(1)

# run the normal flow
from auto_test_vote_flow import main
main()
