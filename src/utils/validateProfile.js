const MIN_OWNER_AGE = 18;
export function getAge(dateOfBirth) {
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function validateProfile({ name, email, phone, idNumber, dateOfBirth }) {
  const errors = {};
  if (!name.trim()) {
    errors.name = "Name is required";
  } else if (name.length < 6 || name.length > 20) {
    errors.name = "Name must be between 6 and 20 characters";
  }
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.com$/i.test(email.trim())) {
    errors.email = "Email must include @ and end with .com";
  }
  if (!phone) {
    errors.phone = "Phone is required";
  } else if (!/^0\d{9}$/.test(phone)) {
    errors.phone = "Phone must be 10 digits and start with 0";
  }
  if (!idNumber.trim()) {
    errors.idNumber = "ID number is required";
  } else if (!/^\d{13}$/.test(idNumber.trim())) {
    errors.idNumber = "ID number must be 13 digits";
  }
  if (!dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    errors.dateOfBirth = "Date of birth must be in YYYY-MM-DD format";
  } else if (getAge(dateOfBirth) < MIN_OWNER_AGE) {
    errors.dateOfBirth = `You must be at least ${MIN_OWNER_AGE} years old`;
  }
  return errors;
}
