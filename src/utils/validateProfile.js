export function validateProfile({ name, email, phone, idNumber, dateOfBirth }) {
    const errors = {};
    if(!name.trim()) {
        errors.name = "Name is required";
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
      if(!idNumber.trim()) {
        errors.idNumber = "ID number is required";
      } else if (!/^\d{13}$/.test(idNumber.trim())) {
        errors.idNumber = "ID number must be 13 digits";
      }
      if (!dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        errors.dateOfBirth = "Date of birth must be in YYYY-MM-DD format";
      }
      return errors;
}