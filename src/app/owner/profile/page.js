import AccountSidebar from "../../../components/AccountSidebar";

export default function OwnerProfilePage() {
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

          <form className="flex flex-1 flex-col gap-6">
            <label className="flex flex-col gap-1">
              <span className="text-body-3 font-bold text-black">
                Your Name*
              </span>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Please enter your name"
                required
              />
            </label>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Email*
                </span>
                <input
                  type="email"
                  name="email"
                  className="input"
                  placeholder="example@email.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Phone*
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  placeholder="Please enter your phone number"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  ID Number
                </span>
                <input
                  type="text"
                  name="idNumber"
                  className="input"
                  placeholder="Your ID number"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Date of Birth
                </span>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="input"
                  required
                />
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
