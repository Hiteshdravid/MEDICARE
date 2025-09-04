from flask_wtf import FlaskForm
from wtforms import StringField, DateTimeField, TextAreaField, SelectField, SubmitField, RadioField
from wtforms.validators import DataRequired, Optional
from wtforms.fields import DateTimeLocalField


class AppointmentForm(FlaskForm):
    full_name = StringField('Full Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    appointment_date = DateTimeLocalField('Appointment Date & Time', format='%Y-%m-%dT%H:%M', validators=[DataRequired()])
    reason = TextAreaField('Reason for Visit')
    doctor = SelectField(
        'Select Doctor',
        choices=[]  # This will be populated dynamically
    )
    submit = SubmitField('Schedule Appointment')


class RegistrationForm(FlaskForm):
    role = RadioField('I am a:', choices=[('doctor', 'Doctor'), ('patient', 'Patient')], default='patient', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    password = StringField('Password', validators=[DataRequired()])
    specialization = StringField('Specialization', validators=[Optional()])  # Optional for patients
    submit = SubmitField('Register')
