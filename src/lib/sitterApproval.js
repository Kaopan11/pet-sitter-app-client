function hasFullProfileData(profile) {
  if (!profile) return false;
  const pending = profile.pending_profile;
  return Boolean(
    profile.address_detail ||
      profile.province ||
      pending?.address_detail ||
      pending?.province ||
      pending?.display_name,
  );
}

export function isFullProfileUnlocked(status, profile) {
  if (["Verified", "Waiting for approve", "Approved"].includes(status)) {
    return true;
  }
  return status === "Rejected" && hasFullProfileData(profile);
}
