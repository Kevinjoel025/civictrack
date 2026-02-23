from auth import create_access_token, decode_token


def run():
    # simulate an integer user id being used when issuing tokens
    data = {"sub": 123}
    token = create_access_token(data)
    print("token:", token)
    payload = decode_token(token)
    print("decoded payload:", payload)


if __name__ == "__main__":
    run()
