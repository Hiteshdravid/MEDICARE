from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_pymongo import PyMongo
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from functools import wraps
from forms import AppointmentForm

import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_change_this_in_production'

# ---------------------------
# MongoDB Configuration
# ---------------------------
app.config["MONGO_URI"] = "mongodb://localhost:27017/Automation"
mongo = PyMongo(app)

# ---------------------------
# Flask-Mail Configuration
# ---------------------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'dravidchellamuthu@gmail.com'
app.config['MAIL_PASSWORD'] = 'eghw xhqz eemu rmbn'
app.config['MAIL_DEFAULT_SENDER'] = 'dravidchellamuthu@gmail.com'
mail = Mail(app)

# ---------------------------
# Login Required Decorator
# ---------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('You must log in to access this page.')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ---------------------------
# Doctor Only Decorator
# ---------------------------
def doctor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('You must log in to access this page.')
            return redirect(url_for('login'))
        if session.get('user_role') != 'doctor':
            flash('This feature is only available to doctors.')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# ---------------------------
# Routes
# ---------------------------
@app.route('/')
def index():
    form = AppointmentForm()
    doctors = list(mongo.db.users.find({'role': 'doctor'}, {'email': 1, 'full_name': 1, 'specialization': 1}))

    appointments = []
    prescriptions = []

    if 'user_id' in session:
        appointments = list(mongo.db.appointments.find({'user_id': session['user_id']})) or []
        prescriptions = list(mongo.db.prescriptions.find({'user_id': session['user_id']})) or []

    return render_template(
        'medicare_scheduler.html',
        form=form,
        appointments=appointments,
        prescriptions=prescriptions,
        doctors=doctors
    )

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = generate_password_hash(request.form['password'])
        role = request.form['role']
        specialization = request.form.get('specialization', '')
        full_name = request.form.get('full_name', '')

        # Check if user already exists
        existing_user = mongo.db.users.find_one({'email': email})
        if existing_user:
            flash('An account with this email already exists.')
            return render_template('register.html')

        user_data = {
            'full_name': full_name,
            'email': email,
            'password': password,
            'role': role,
            'created_via_oauth': False
        }
        if role == 'doctor' and specialization:
            user_data['specialization'] = specialization

        mongo.db.users.insert_one(user_data)
        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = mongo.db.users.find_one({'email': email})

        if user and user.get('password') and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['user_role'] = user.get('role', 'patient')
            session['user_name'] = user.get('full_name', email)
            flash('Login successful!')
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.')
    return redirect(url_for('login'))

# ---------------------------
# Appointment Routes
# ---------------------------
@app.route('/schedule_appointment', methods=['POST'])
@login_required
def schedule_appointment():
    full_name = request.form['full_name']
    email = request.form['email']
    appointment_date = request.form['appointment_date']
    reason = request.form['reason']
    doctor_email = request.form['doctor']

    doctor = mongo.db.users.find_one({'email': doctor_email, 'role': 'doctor'})
    if not doctor:
        flash('Selected doctor not found. Please select a valid doctor.')
        return redirect(url_for('index'))

    mongo.db.appointments.insert_one({
        'full_name': full_name,
        'email': email,
        'appointment_date': appointment_date,
        'reason': reason,
        'user_id': session['user_id'],
        'status': 'Scheduled',
        'doctor_name': doctor.get('full_name', doctor_email),
        'doctor_name': doctor_email,
        'doctor_specialization': doctor.get('specialization', 'General Medicine')
    })

    subject = "Appointment Confirmation"
    body = f"Dear {full_name},\n\nYour appointment has been scheduled for {appointment_date}.\nDoctor: {doctor_email}\nSpecialization: {doctor.get('specialization', 'General Medicine')}\nReason: {reason}\n\nThank you!"
    send_email(subject, email, body)

    flash('Appointment scheduled successfully! A confirmation email has been sent.')
    return redirect(url_for('index'))

@app.route('/cancel_appointment/<appointment_id>')
@login_required
def cancel_appointment(appointment_id):
    appointment = mongo.db.appointments.find_one({'_id': ObjectId(appointment_id)})
    if appointment:
        mongo.db.appointments.update_one(
            {'_id': ObjectId(appointment_id)},
            {'$set': {'status': 'Cancelled'}}
        )
        subject = "Appointment Cancellation"
        body = f"Dear {appointment['full_name']},\n\nYour appointment on {appointment['appointment_date']} has been cancelled successfully.\n\nThank you,\nMediCare Team"
        send_email(subject, appointment['email'], body)
        flash("Appointment cancelled successfully! A confirmation email has been sent.")
    return redirect(url_for('index'))

# ---------------------------
# Prescription Routes
# ---------------------------
@app.route('/add_prescription', methods=['POST'])
@doctor_required
def add_prescription():
    email = request.form['email']
    p_type = request.form['type']
    medication = request.form['medication']
    dosage = request.form['dosage']
    start_date = request.form['start_date']
    end_date = request.form.get('end_date', '')
    instructions = request.form.get('instructions', '')

    mongo.db.prescriptions.insert_one({
        'email': email,
        'type': p_type,
        'medication': medication,
        'dosage': dosage,
        'start_date': start_date,
        'end_date': end_date,
        'instructions': instructions,
        'user_id': session['user_id']
    })

    if 'emailNotification' in request.form:
        subject = "New Prescription Added"
        body = f"Prescription: {medication}\nType: {p_type}\nDosage: {dosage}\nInstructions: {instructions}"
        send_email(subject, email, body)

    flash('Prescription added successfully!')
    return redirect(url_for('index'))

@app.route('/delete_prescription/<prescription_id>')
@doctor_required
def delete_prescription(prescription_id):
    prescription = mongo.db.prescriptions.find_one({'_id': ObjectId(prescription_id)})
    if prescription:
        mongo.db.prescriptions.delete_one({'_id': ObjectId(prescription_id)})
        flash('Prescription deleted successfully!')
    return redirect(url_for('index'))

# ---------------------------
# Email Function
# ---------------------------
def send_email(subject, recipient, body):
    try:
        msg = Message(subject, recipients=[recipient])
        msg.body = body
        mail.send(msg)
    except Exception as e:
        print(f"Email sending failed: {e}")

# ---------------------------
# Run the App
# ---------------------------
if __name__ == '__main__':
    app.run(debug=True)
