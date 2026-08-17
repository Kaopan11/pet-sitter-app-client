// ปุ่ม Facebook / Google ตาม Figma — ไอคอนจาก public/icon ยังไม่ต่อ OAuth
export default function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-body-3 text-gray-400">Or Continue With</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-social w-full gap-2">
          <img src="/icon/facebook.svg" alt="" className="size-5" />
          Facebook
        </button>
        <button type="button" className="btn btn-social w-full gap-2">
          <img src="/icon/google.svg" alt="" className="size-5" />
          Gmail
        </button>
      </div>
    </div>
  );
}
