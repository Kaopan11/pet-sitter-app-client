export const MOCK_PETS = [
  {
    id: "1",
    name: "Bubba",
    type: "Dog",
    breed: "Pitbull",
    sex: "Male",
    age: "48",
    color: "Black and white",
    weight: "25",
    about: "Calm and loyal guard dog.",
    image: "/image/dog1.jpg",
  },
  {
    id: "2",
    name: "Daisy",
    type: "Dog",
    breed: "Beagle",
    sex: "Female",
    age: "6",
    color: "White, black and brown",
    weight: "2",
    about: "Woof Woof",
    image: "/image/dog2.jpg",
  },
  {
    id: "3",
    name: "I Som",
    type: "Cat",
    breed: "Persian",
    sex: "Male",
    age: "24",
    color: "Orange",
    weight: "4",
    about: "Loves sleeping on the sofa.",
    image: "/image/cat.jpg",
  },
  {
    id: "4",
    name: "Noodle Birb",
    type: "Bird",
    breed: "Parrot",
    sex: "Male",
    age: "12",
    color: "Green and yellow",
    weight: "0.3",
    about: "Loves singing and mimicking words.",
    image: "/image/bird.jpg",
  },
];

export function getMockPetById(id) {
  return MOCK_PETS.find((pet) => pet.id === String(id)) ?? null;
}
