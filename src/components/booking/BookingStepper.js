/** Stepper 3 ขั้น — active = ส้ม, completed = ดำ, upcoming = เทา */
const STEPS = [
  { id: 1, label: "Your Pet" },
  { id: 2, label: "Information" },
  { id: 3, label: "Payment" },
];

export default function BookingStepper({ currentStep }) {
  return (
    <nav
      aria-label="Booking progress"
      className="rounded-2xl bg-white px-4 py-4 shadow-(--shadow-card) md:px-10 md:py-5"
    >
      <ol className="flex w-full items-center justify-between gap-2 md:justify-center md:gap-16">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          let circleClass = "bg-gray-200 text-white";
          let labelClass = "font-medium text-gray-300";

          if (isCompleted) {
            circleClass = "bg-black text-white";
            labelClass = "font-medium text-black";
          } else if (isActive) {
            circleClass = "bg-orange-500 text-white";
            labelClass = "font-bold text-orange-500";
          }

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-row items-center gap-2 md:gap-3"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-body-3 font-bold ${circleClass}`}
                aria-current={isActive ? "step" : undefined}
              >
                {step.id}
              </span>
              <span
                className={`truncate text-body-3 md:text-body-2 ${labelClass}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
