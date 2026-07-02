const TICKS_PER_SECOND = 10_000_000;

export function formatRuntime(ticks: number | null | undefined): string {
    if (!ticks || ticks <= 0) return '';
    const totalMinutes = Math.round(ticks / TICKS_PER_SECOND / 60);
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatEndTime(ticks: number | null | undefined, startTime = Date.now()): string {
    if (!ticks || ticks <= 0) return '';
    const totalSeconds = Math.round(ticks / TICKS_PER_SECOND);
    const endDate = new Date(startTime + totalSeconds * 1000);
    const hh = String(endDate.getHours()).padStart(2, '0');
    const mm = String(endDate.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

export function formatProgress(ticks: number | null | undefined, runtimeTicks: number | null | undefined): number {
    if (!ticks || !runtimeTicks || runtimeTicks <= 0) return 0;
    return Math.min(100, Math.max(0, (ticks / runtimeTicks) * 100));
}

export function formatYear(year: number | null | undefined): string {
    if (!year) return '';
    return String(year);
}
