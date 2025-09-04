#!/usr/bin/env python3
"""
Script to check doctors in the database
"""

from main import app, mongo

with app.app_context():
    doctors = list(mongo.db.users.find({'role': 'doctor'}))
    print(f'Found {len(doctors)} doctors:')
    for doc in doctors:
        print(f'Email: {doc.get("email")}')
        print(f'Name: {doc.get("full_name", "Not set")}')
        print(f'Specialization: {doc.get("specialization", "Not set")}')
        print('---')
