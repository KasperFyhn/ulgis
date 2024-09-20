import sys
from getpass import getpass

from app.db.base import SessionLocal
from app.db.models import AdminUserOrm
from app.passwordhash import get_password_hash

try:
    session = SessionLocal()
except Exception as e:
    print(f"Exception while initializing database: {e}")
    print(
        "Maybe you need to create a .env file with a DATABASE_URL environment variable?"
    )
    sys.exit(1)

name = input("Input user name: ").strip()
password = getpass("Input password: ").strip()
password_repeat = getpass("Repeat password: ").strip()

if password != password_repeat:
    print("Passwords do not match")
    sys.exit(1)

if " " in password:
    print("Password cannot contain spaces!")
    sys.exit(1)

admin = AdminUserOrm(name=name, password_hash=get_password_hash(password))
session.add(admin)
session.commit()

print(f"Admin '{name}' successfully created")
