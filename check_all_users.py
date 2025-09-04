#!/usr/bin/env python3
"""
Script to check all users in the database
"""

from main import app, mongo

with app.app_context():
    users = list(mongo.db.users.find({}))
    print(f'Found {len(users)} users:')
    for user in users:
        print(f'Email: {user.get("email")}')
        print(f'Role: {user.get("role", "Not set")}')
        print(f'Name: {user.get("full_name", "Not set")}')
        print(f'Specialization: {user.get("specialization", "Not set")}')
        print('---')
