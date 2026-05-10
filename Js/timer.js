export function getRemainingTime(endTime) {
  const remaining = Math.floor((endTime - Date.now()) / 1000);

  return remaining > 0 ? remaining : 0;
}
