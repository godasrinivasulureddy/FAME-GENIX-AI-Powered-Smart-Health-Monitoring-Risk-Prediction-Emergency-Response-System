import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, init_db, engine
from app.db.models import User, Patient, Doctor, Role
from app.core.security import hash_password

def seed():
    print("Resetting database...")
    # Drop all tables first or delete sqlite file
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fame_genix.db")
    if os.path.exists(db_file):
        try:
            # Close connection pools
            engine.dispose()
            os.remove(db_file)
            print("Deleted old database file.")
        except Exception as e:
            print(f"Could not delete database file: {e}")

    # Recreate tables
    init_db()
    print("Database tables initialized.")

    db = SessionLocal()
    try:
        # Create Patient
        patient_user = User(
            email="patient@famegenix.com",
            password_hash=hash_password("password123"),
            role=Role.PATIENT
        )
        db.add(patient_user)
        db.flush()
        count = db.query(Patient).count() + 1
        pub_id = f"FG-P-{str(count).zfill(6)}"
        patient = Patient(
            user_id=patient_user.id,
            public_id=pub_id,
            full_name="Alex Mercer",
            date_of_birth="1985-04-12",
            sex="Male",
            age=39,
            height_cm=178.0,
            weight_kg=75.0,
            known_conditions="Pre-diabetic, mild pollen allergy",
            emergency_contact_name="Jane Doe",
            emergency_contact_phone="+1 (555) 019-2834"
        )
        db.add(patient)

        # Create Doctor
        doctor_user = User(
            email="doctor@famegenix.com",
            password_hash=hash_password("password123"),
            role=Role.DOCTOR
        )
        db.add(doctor_user)
        db.flush()
        doctor = Doctor(
            user_id=doctor_user.id,
            full_name="Dr. Sarah Jenkins",
            specialty="Cardiologist"
        )
        db.add(doctor)

        # Create Operator
        operator_user = User(
            email="operator@famegenix.com",
            password_hash=hash_password("password123"),
            role=Role.EMERGENCY_OPERATOR
        )
        db.add(operator_user)

        # Create Ambulance
        ambulance_user = User(
            email="ambulance@famegenix.com",
            password_hash=hash_password("password123"),
            role=Role.AMBULANCE_TEAM
        )
        db.add(ambulance_user)

        db.commit()
        print("Demo seed completed successfully!")
        print("Created accounts:")
        print("  - Patient:            patient@famegenix.com / password123")
        print("  - Doctor:             doctor@famegenix.com / password123")
        print("  - Emergency Operator: operator@famegenix.com / password123")
        print("  - Ambulance Team:     ambulance@famegenix.com / password123")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
