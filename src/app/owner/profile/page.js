import React from "react";
import Link from "next/link";


export default function OwnerProfilePage() {
  return (
    <div className="flex bg-gray-100 h-full">
      <div className="flex flex-row mt-6 mx-10 w-full justify-center">
        <div className="flex flex-col m-4 p-6 mr-6 bg-white rounded-lg shadow-md h-[289px] w-[292px]">
          <div className="text-h4 font-bold">Account</div>
        </div>
        <div className="flex flex-col m-4 p-6 ml-6 bg-white rounded-lg shadow-md w-2/3 h-[888px]">
          <div className="flex flex-col gap-[10px]">
            <div className="text-h3 font-bold">Profile</div>
          </div>
        </div>
      </div>

    </div>
  );
}