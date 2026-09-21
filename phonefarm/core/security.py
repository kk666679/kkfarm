from typing import Optional
import os
import jwt
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import json

class SecurityManager:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.encryption_key = os.getenv('ENCRYPTION_KEY')
        if not self.encryption_key:
            self.encryption_key = Fernet.generate_key().decode()
        self.cipher = Fernet(self.encryption_key.encode() if isinstance(self.encryption_key, str) else self.encryption_key)

    def generate_device_token(self, device_id: str) -> str:
        payload = {
            'device_id': device_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')

    def verify_device_token(self, token: str) -> Optional[str]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload.get('device_id')
        except jwt.InvalidTokenError:
            return None

    def encrypt_task(self, task_data: dict) -> bytes:
        return self.cipher.encrypt(json.dumps(task_data).encode())

    def decrypt_task(self, encrypted_data: bytes) -> dict:
        decrypted = self.cipher.decrypt(encrypted_data)
        return json.loads(decrypted)
