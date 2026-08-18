"use client";

import { useState } from "react";
import AccountSidebar from "../../../components/AccountSidebar";
import { validateProfile } from "../../../utils/validateProfile";

export default function OwnerProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProfile({ name, email, phone, idNumber });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    console.log({ name, email, phone, idNumber, dateOfBirth });
  }

  return (
    <div className="flex h-full bg-gray-100">
      <div className="mx-10 mt-6 flex w-full flex-row justify-center">
        <AccountSidebar />

        <div className="card m-4 ml-6 flex min-h-[888px] w-2/3 flex-col p-10">
          <h3 className="text-h3">Profile</h3>

          <div className="relative mx-4 my-8 size-50">
            <div className="size-50 rounded-full bg-gray-100" />
            <button
              type="button"
              className="btn-secondary absolute right-1 bottom-1 flex size-10 items-center justify-center rounded-full"
            >
              +
            </button>
          </div>

          <form
            onSubmit={handleSubmit} noValidate 
            className="flex flex-1 flex-col gap-6"
          >
            <label className="flex flex-col gap-1">
              <span className="text-body-3 font-bold text-black">
                Your Name*
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Please enter your name"
              />
              {errors.name && <p className="text-red-500 text-body-3">{errors.name}</p>}
            </label>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Email*
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-body-3">{errors.email}</p>}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Phone*
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={`input ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="Please enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-body-3">{errors.phone}</p>}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  ID Number
                </span>
                <input
                  type="text"
                  name="idNumber"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  className={`input ${errors.idNumber ? "border-red-500" : ""}`}
                  placeholder="Your ID number"
                />
                {errors.idNumber && <p className="text-red-500 text-body-3">{errors.idNumber}</p>}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Date of Birth
                </span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className={`input ${errors.dateOfBirth ? "border-red-500" : ""}`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-body-3">{errors.dateOfBirth}</p>}
              </label>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
