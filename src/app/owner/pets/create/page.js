import AccountSidebar from "../../../components/AccountSidebar";

export default function OwnerPetsCreatePage() {
  return (
    <div className="flex h-full bg-gray-100">
      <div className="mx-10 mt-6 flex w-full flex-row justify-center">
        <AccountSidebar />

        <div className="card m-4 ml-6 flex min-h-[888px] w-2/3 flex-col p-10">
          <h3 className="text-h3">Your Pet</h3>
          <div className="mx-4 my-8">
          <div className="relative my-8 w-fit self-start">
          <div className="relative size-60 overflow-hidden rounded-full bg-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Owner profile"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                <UserRound className="size-24 text-white" aria-hidden="true" />
              </div>
              )}
            </div>
            <button
              type="button"
              className="btn-secondary absolute right-1 bottom-1 flex size-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed"
              aria-label="Upload profile photo"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isLoading || isSaving}
            >
              <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <input
              ref={avatarInputRef}
              className="hidden"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleAvatarChange}
            />
            </div>
            {errors.avatar && (
              <p className="mt-2 text-body-3 text-red-500">{errors.avatar}</p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-1 flex-col gap-6"
          >
            <label className="flex flex-col gap-1">
              <span className="text-body-3 font-bold text-black">
                Your Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Please enter your name"
                disabled={isLoading || isSaving}
              />
              {errors.name && (
                <p className="text-body-3 text-red-500">{errors.name}</p>
              )}
            </label>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Email <span className="text-red-500">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  placeholder="example@email.com"
                  disabled={isLoading || isSaving}
                />
                {errors.email && (
                  <p className="text-body-3 text-red-500">{errors.email}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Phone <span className="text-red-500">*</span>
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={`input ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="Please enter your phone number"
                  disabled={isLoading || isSaving}
                />
                {errors.phone && (
                  <p className="text-body-3 text-red-500">{errors.phone}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  ID Number <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="idNumber"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  className={`input ${errors.idNumber ? "border-red-500" : ""}`}
                  placeholder="Your ID number"
                  disabled={isLoading || isSaving}
                />
                {errors.idNumber && (
                  <p className="text-body-3 text-red-500">{errors.idNumber}</p>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-body-3 font-bold text-black">
                  Date of Birth <span className="text-red-500">*</span>
                </span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className={`input ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  disabled={isLoading || isSaving}
                />
                {errors.dateOfBirth && (
                  <p className="text-body-3 text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || isSaving}
              >
                {isSaving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
