"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock pet owners database for admin view
const MOCK_PET_OWNERS = {
  "1": {
    id: 1,
    name: "John Wick",
    phone: "099 996 6734",
    email: "johnwicklovedogs@dogorg.com",
    idCard: "1122 21 236 8654",
    dob: "2 Sep 1964",
    status: "Normal",
    avatar: "/image/content1.png",
    joinedDate: "15 Jan 2026",
    pets: [
      {
        id: 101,
        name: "Bubba",
        type: "Dog",
        breed: "Pitbull",
        sex: "Male",
        age: "4 Years",
        color: "Black and white",
        weight: "25 Kilogram",
        about: "Calm and loyal guard dog.",
        image: "/image/lovely-pet-portrait-isolated 1.png",
        isSuspended: false,
      },
      {
        id: 102,
        name: "Daisy",
        type: "Dog",
        breed: "Beagle",
        sex: "Female",
        age: "0.6 Month",
        color: "White, black and brown",
        weight: "2 Kilogram",
        about: "Woof Woof",
        image: "/image/section-dog.png",
        isSuspended: false,
      },
      {
        id: 103,
        name: "I Som",
        type: "Cat",
        breed: "Persian",
        sex: "Male",
        age: "2 Years",
        color: "Orange",
        weight: "4 Kilogram",
        about: "Loves sleeping on the sofa.",
        image: "/image/section-cat.png",
        isSuspended: false,
      },
      {
        id: 104,
        name: "Noodle Birb",
        type: "Bird",
        breed: "Parrot",
        sex: "Male",
        age: "1 Year",
        color: "Green and yellow",
        weight: "0.3 Kilogram",
        about: "Loves singing and mimicking words.",
        image: "/image/content2.png",
        isSuspended: false,
      },
    ],
    reviews: [
      {
        id: 1,
        sitterName: "Jane Maison",
        sitterAvatar: "/image/content2.png",
        date: "Aug 16, 2023",
        rating: 4,
        comment: "Nice customer, with good bois!",
      },
      {
        id: 2,
        sitterName: "Emily B.",
        sitterAvatar: "/image/content3.png",
        date: "Aug 16, 2023",
        rating: 5,
        comment: "His cat is so cute",
      },
    ],
  },
  "2": {
    id: 2,
    name: "Sarah Connor",
    phone: "081 234 5678",
    email: "sarah@cyberdyne.com",
    idCard: "1122 21 236 8888",
    dob: "13 May 1965",
    status: "Normal",
    avatar: "/image/content2.png",
    joinedDate: "02 Feb 2026",
    pets: [
      {
        id: 105,
        name: "Wolfie",
        type: "Dog",
        breed: "German Shepherd",
        sex: "Male",
        age: "3 Years",
        color: "Black and tan",
        weight: "30 Kilogram",
        about: "Alert and well-trained.",
        image: "/image/section-dog.png",
        isSuspended: false,
      },
    ],
    reviews: [],
  },
  "3": {
    id: 3,
    name: "Bruce Wayne",
    phone: "089 876 5432",
    email: "bruce@wayneenterprises.com",
    idCard: "1122 21 236 9999",
    dob: "19 Feb 1972",
    status: "Normal",
    avatar: "/image/content3.png",
    joinedDate: "20 Dec 2025",
    pets: [
      {
        id: 106,
        name: "Ace",
        type: "Dog",
        breed: "Great Dane",
        sex: "Male",
        age: "5 Years",
        color: "Black",
        weight: "50 Kilogram",
        about: "Big giant but very gentle with humans.",
        image: "/image/lovely-pet-portrait-isolated 1.png",
        isSuspended: false,
      },
    ],
    reviews: [],
  },
  "4": {
    id: 4,
    name: "Peter Parker",
    phone: "086 555 4321",
    email: "peter.parker@dailybugle.com",
    idCard: "1122 21 236 4444",
    dob: "10 Aug 2001",
    status: "Banned",
    avatar: "/image/content1.png",
    joinedDate: "10 Nov 2025",
    pets: [
      {
        id: 107,
        name: "Spider",
        type: "Cat",
        breed: "Domestic Shorthair",
        sex: "Male",
        age: "1 Year",
        color: "Black",
        weight: "3 Kilogram",
        about: "Energetic kitten.",
        image: "/image/section-cat.png",
        isSuspended: false,
      },
    ],
    reviews: [],
  },
};

export default function AdminPetOwnerDetailPage() {
  const routerParams = useParams();
  const ownerId = routerParams?.id || "1";
  const owner = MOCK_PET_OWNERS[ownerId] || MOCK_PET_OWNERS["1"];

  const [activeTab, setActiveTab] = useState("Profile");
  const [ownerStatus, setOwnerStatus] = useState(owner.status);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  // Pets state
  const [petsList, setPetsList] = useState(owner.pets || []);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const handleToggleBanStatus = () => {
    setOwnerStatus((prev) => (prev === "Normal" ? "Banned" : "Normal"));
    setIsBanModalOpen(false);
  };

  const handleSuspendPet = () => {
    if (selectedPet) {
      setPetsList((prev) =>
        prev.map((pet) =>
          pet.id === selectedPet.id ? { ...pet, isSuspended: true } : pet
        )
      );
    }
    setIsSuspendModalOpen(false);
    setSelectedPet(null);
  };

  const getPetTypeBadge = (type) => {
    const lower = type?.toLowerCase();
    if (lower === "dog") {
      return "bg-[#E7F9F1] text-[#1CCD83]";
    } else if (lower === "cat") {
      return "bg-[#FDF0F6] text-[#FA8AC0]";
    } else if (lower === "bird") {
      return "bg-[#EAF6FF] text-[#36B2EC]";
    }
    return "bg-[#FFF1EC] text-[#FF7037]";
  };

  const activePets = petsList.filter((p) => !p.isSuspended);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-12">
      {/* Top Header / Back Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/pet-owner"
          className="flex items-center gap-3 text-gray-900 hover:text-[#FF7037] transition-colors group"
        >
          <svg
            className="w-5 h-5 text-gray-700 group-hover:text-[#FF7037] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{owner.name}</h1>
        </Link>
      </div>

      {/* Tabs & Content Section (Attached together) */}
      <div className="flex flex-col">
        {/* Tabs Navigation Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("Profile")}
            className={`px-8 py-3 rounded-t-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "Profile"
                ? "bg-white text-[#FF7037]"
                : "bg-[#E5E7EE] text-[#7B7E8C] hover:bg-[#DCDFE9] hover:text-[#525665]"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("Pets")}
            className={`px-8 py-3 rounded-t-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "Pets"
                ? "bg-white text-[#FF7037]"
                : "bg-[#E5E7EE] text-[#7B7E8C] hover:bg-[#DCDFE9] hover:text-[#525665]"
            }`}
          >
            Pets
          </button>
          <button
            onClick={() => setActiveTab("Reviews")}
            className={`px-8 py-3 rounded-t-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "Reviews"
                ? "bg-white text-[#FF7037]"
                : "bg-[#E5E7EE] text-[#7B7E8C] hover:bg-[#DCDFE9] hover:text-[#525665]"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "Profile" && (
          <div className="bg-white rounded-2xl rounded-tl-none p-8 sm:p-10 border border-gray-100/60 shadow-xs flex flex-col justify-between min-h-[440px]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 w-full">
            {/* Left Avatar */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-100 shadow-xs">
              <Image
                src={owner.avatar}
                alt={owner.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Right Info Fields */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 sm:p-8 flex-1 w-full flex flex-col gap-5">
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[#8C94A4] mb-1">
                  Pet Owner Name
                </span>
                <span className="block text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {owner.name}
                </span>
              </div>

              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[#8C94A4] mb-1">
                  Email
                </span>
                <span className="block text-sm sm:text-base font-semibold text-[#1A1A1A] break-all">
                  {owner.email}
                </span>
              </div>

              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[#8C94A4] mb-1">
                  Phone
                </span>
                <span className="block text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {owner.phone}
                </span>
              </div>

              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[#8C94A4] mb-1">
                  ID Number
                </span>
                <span className="block text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {owner.idCard}
                </span>
              </div>

              <div>
                <span className="block text-xs sm:text-sm font-semibold text-[#8C94A4] mb-1">
                  Date of Birth
                </span>
                <span className="block text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {owner.dob || "2 Sep 1964"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Right Ban / Unban Link */}
          <div className="flex justify-end pt-8">
            <button
              onClick={() => setIsBanModalOpen(true)}
              className="text-[#FF7037] hover:text-[#E0561B] font-bold text-sm sm:text-base cursor-pointer hover:underline transition-colors"
            >
              {ownerStatus === "Banned" ? "Unban This User" : "Ban This User"}
            </button>
          </div>
        </div>
      )}

      {/* Pets Tab Content */}
      {activeTab === "Pets" && (
        <div className="bg-white rounded-2xl rounded-tl-none p-8 sm:p-10 border border-gray-100/60 shadow-xs flex flex-col gap-6 min-h-[440px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {activePets.length > 0 ? (
              activePets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className="border border-gray-200/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#FF7037] transition-all hover:shadow-xs bg-white"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-bold text-[#1A1A1A] text-base">{pet.name}</span>
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${getPetTypeBadge(
                      pet.type
                    )}`}
                  >
                    {pet.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 font-medium">
                No active pets found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Tab Content */}
      {activeTab === "Reviews" && (
        <div className="bg-white rounded-2xl rounded-tl-none p-8 sm:p-10 border border-gray-100/60 shadow-xs flex flex-col gap-6 min-h-[440px]">
          {owner.reviews && owner.reviews.length > 0 ? (
            <div className="flex flex-col divide-y divide-gray-100">
              {owner.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      <Image
                        src={rev.sitterAvatar}
                        alt={rev.sitterName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1A1A1A] text-base">
                        {rev.sitterName}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 sm:max-w-md sm:text-left">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? "text-[#1CCD83] fill-[#1CCD83]"
                              : "text-gray-200 fill-gray-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{rev.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 font-medium">
              No reviews for this pet owner yet.
            </div>
          )}
        </div>
      )}
      </div>

      {/* Confirmation Modal (Ban / Unban User) */}
      {isBanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                {ownerStatus === "Banned" ? "Unban User" : "Ban User"}
              </h3>
              <button
                onClick={() => setIsBanModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 text-sm text-gray-600">
              <p>
                {ownerStatus === "Banned"
                  ? "Are you sure to unban this user?"
                  : "Are you sure to ban this user?"}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setIsBanModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#FF7037] bg-[#FFF1EC] hover:bg-[#FFE5DC] transition-colors flex-1 text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBanStatus}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#FF7037] hover:bg-[#E0561B] transition-colors flex-1 text-center cursor-pointer shadow-xs"
              >
                {ownerStatus === "Banned" ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && !isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A]">{selectedPet.name}</h3>
              <button
                onClick={() => setSelectedPet(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Pet Photo */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shadow-xs">
                  <Image
                    src={selectedPet.image}
                    alt={selectedPet.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-[#1A1A1A] text-base">{selectedPet.name}</span>
              </div>

              {/* Pet Info Grid */}
              <div className="bg-[#F8F9FA] rounded-2xl p-6 flex-1 w-full grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Pet Type
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">{selectedPet.type}</span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Breed
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">{selectedPet.breed}</span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Sex
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">{selectedPet.sex}</span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Age
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">{selectedPet.age}</span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Color
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">
                    {selectedPet.color || "White, black and brown"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    Weight
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">
                    {selectedPet.weight || "2 Kilogram"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-xs font-semibold text-[#8C94A4] mb-0.5">
                    About
                  </span>
                  <span className="block font-medium text-[#1A1A1A]">
                    {selectedPet.about || "Woof Woof"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Suspend Link */}
            <div className="flex justify-end px-6 sm:px-8 pb-6">
              <button
                onClick={() => setIsSuspendModalOpen(true)}
                className="text-[#FF7037] hover:text-[#E0561B] font-bold text-sm cursor-pointer hover:underline transition-colors"
              >
                Suspend This Pet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Pet Confirmation Modal */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Suspend Pet</h3>
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 text-sm text-gray-600">
              <p>Are you sure to suspend this pet?</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#FF7037] bg-[#FFF1EC] hover:bg-[#FFE5DC] transition-colors flex-1 text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendPet}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#FF7037] hover:bg-[#E0561B] transition-colors flex-1 text-center cursor-pointer shadow-xs"
              >
                Suspend This Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

