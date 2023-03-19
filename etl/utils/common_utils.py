import base64


def decode_base64_data(encoded_data):
    _, file_data = encoded_data.split(";base64,")
    return base64.b64decode(file_data)
