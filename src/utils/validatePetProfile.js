export function validatePetProfile({ name, petType, breed, sex, age, color, weight }) {
    const errors = {};
  
    if (!name.trim()) {
      errors.name = "Pet name is required";
    }
    if (!petType) {
      errors.petType = "Pet type is required";
    }
    if (!breed.trim()) {
      errors.breed = "Breed is required";
    }
    if (!sex) {
      errors.sex = "Sex is required";
    }
    if (!age.trim()) {
      errors.age = "Age is required";
    } else if (!/^\d+(\.\d+)?$/.test(age.trim()) || Number(age) < 0) {
      errors.age = "Age must be a number";
    }
    if (!color.trim()) {
      errors.color = "Color is required";
    }
    if (!weight.trim()) {
      errors.weight = "Weight is required";
    } else if (!/^\d+(\.\d+)?$/.test(weight.trim()) || Number(weight) <= 0) {
      errors.weight = "Weight must be a number";
    }
  
    return errors;
  }