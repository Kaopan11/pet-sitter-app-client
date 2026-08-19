/**
 * Mock สำหรับ Day 1 (ยังไม่ต่อ API)
 * Day 2+: แทนด้วย getSitterById / getMyPets / user profile
 */

export const MOCK_SITTER = {
  id: "mock-sitter-1",
  displayName: "Happy House!",
  sitterName: "Jane Maison",
  avatarUrl: "/navbar/profile.png",
  petTypes: ["dog", "cat", "rabbit"], // bird ใน mock pets จะเลือกไม่ได้
};

export const MOCK_PETS = [
  {
    id: 1,
    name: "Bubba",
    petType: "dog",
    avatarUrl: "/image/section-dog.png",
  },
  {
    id: 2,
    name: "Daisy",
    petType: "dog",
    avatarUrl: "/image/content2.png",
  },
  {
    id: 3,
    name: "I Som",
    petType: "cat",
    avatarUrl: "/image/section-cat.png",
  },
  {
    id: 4,
    name: "Noodle Birb",
    petType: "bird",
    avatarUrl: "/image/content1.png",
  },
];

/** ค่าว่างเริ่มต้น — ไม่ใส่ชื่อปลอม */
export const MOCK_GUEST = {
  name: "",
  email: "",
  phone: "",
};
