declare global {
    interface Window {
        gtag: (
            type: 'event' | 'config' | 'set' | 'js',
            action: string,
            params?: Record<string, string | number | boolean | any>
        ) => void;
    }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-7LV493E2Q0';

// https://developers.google.com/analytics/devguides/collection/ga4/events?client_type=gtag
export const trackEvent = (
    action: string,
    params?: Record<string, string | number | boolean>
) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        window.gtag('event', action, params);
    } else {
        console.log(`[GA Event Log]: ${action}`, params);
    }
};
