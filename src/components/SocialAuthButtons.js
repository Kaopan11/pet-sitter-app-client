// ปุ่ม Facebook / Google ตาม Figma — ไอคอนจาก public/icon ยังไม่ต่อ OAuth
export default function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="shrink-0 text-body-3 text-gray-400">Or Continue With</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button type="button" className="btn btn-social w-full gap-1.5 sm:gap-2">
          <img src="/icon/facebook.svg" alt="" className="size-5 shrink-0" />
          <span className="truncate">Facebook</span>
        </button>
        <button type="button" className="btn btn-social w-full gap-1.5 sm:gap-2">
          <img src="/icon/google.svg" alt="" className="size-5 shrink-0" />
          <span className="truncate">Gmail</span>
        </button>
      </div>
    </div>
  );
}
