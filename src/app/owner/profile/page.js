import React from "react";

export default function OwnerProfilePage() {
  return (
    <div className="flex flex-row bg-gray-100 h-screen">
      <div className="flex flex-col mt-20 m-4 gap-2 bg-white rounded-lg p-4 shadow-md w-1/3">
        <h4>Account</h4>
      </div>
      <div className="flex flex-col mt-20 m-4 p-4 bg-white rounded-lg shadow-md w-2/3">
        <div className="flex flex-col gap-2">
          <h4 className="text-2xl font-bold">Profile</h4>
        </div>
      </div>

    </div>
  );
}