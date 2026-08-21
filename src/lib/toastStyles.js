const successToastClassNames = {
  toast: "!bg-green !pr-10 !w-[400px]",
  title: "!text-white !font-semibold !text-base",
  description: "!text-white/95 !text-sm",
  closeButton:
    "!left-auto !right-4 !top-4 !transform-none !size-7 [&>svg]:!size-5 !border-none !bg-transparent !text-white hover:!bg-white/20",
};

const errorToastClassNames = {
  toast: "!bg-red !w-[400px] !pr-10",
  title: "!text-white !font-semibold !text-base",
  description: "!text-white/95 !text-sm",
  closeButton:
    "!left-auto !right-4 !top-4 !transform-none !size-7 [&>svg]:!size-5 !border-none !bg-transparent !text-white hover:!bg-white/20",
};

export { successToastClassNames, errorToastClassNames };
