export const UPGRADE_EVENT_NAME = "upgrade-required";

export interface UpgradePromptDetail {
  feature?: string;
  planSlug?: string;
  message: string;
  limit?: number;
  currentCount?: number;
}

const upgradeBus = new EventTarget();

export function triggerUpgradePrompt(detail: UpgradePromptDetail): void {
  upgradeBus.dispatchEvent(new CustomEvent(UPGRADE_EVENT_NAME, { detail }));
}

export function subscribeToUpgradePrompts(
  listener: (detail: UpgradePromptDetail) => void,
): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<UpgradePromptDetail>).detail);
  upgradeBus.addEventListener(UPGRADE_EVENT_NAME, handler);
  return () => upgradeBus.removeEventListener(UPGRADE_EVENT_NAME, handler);
}
