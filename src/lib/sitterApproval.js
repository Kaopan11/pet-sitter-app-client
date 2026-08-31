export function isFullProfileUnlocked(status) {
  return [
    "Verified",
    "Waiting for approve",
    "Approved",
    "Rejected",
  ].includes(status);
}
