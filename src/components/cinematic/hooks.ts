import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';

export type RefCallback<T extends HTMLElement> = (el: T | null) => void;

export type ParallaxOptions = {
    factor?: number;
    maxOffset?: number;
};

export type ParallaxApi = {
    ref: RefCallback<HTMLElement>;
    y: number;
};

export function useParallax(options: ParallaxOptions = {}): ParallaxApi {
    const { factor = 0.25, maxOffset = 240 } = options;
    const elRef = useRef<HTMLElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const [y, setY] = useState(0);

    const setRef = useCallback<RefCallback<HTMLElement>>((el) => {
        elRef.current = el;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const update = () => {
            const el = elRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const viewport = window.innerHeight || 1;
            const center = rect.top + rect.height / 2 - viewport / 2;
            const raw = -center * factor;
            const next = Math.max(-maxOffset, Math.min(maxOffset, raw));
            el.style.setProperty('--cine-py', `${next.toFixed(2)}px`);
            setY(next);
            rafRef.current = null;
        };

        const onScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [factor, maxOffset]);

    return { ref: setRef, y };
}

export type SpotlightApi = {
    ref: RefCallback<HTMLElement>;
    x: number;
    y: number;
    active: boolean;
};

export function useSpotlight(): SpotlightApi {
    const elRef = useRef<HTMLElement | null>(null);
    const [pos, setPos] = useState<{ x: number; y: number; active: boolean }>({
        x: 50,
        y: 35,
        active: false
    });

    const setRef = useCallback<RefCallback<HTMLElement>>((el) => {
        elRef.current = el;
    }, []);

    const onMove = useCallback((e: globalThis.MouseEvent) => {
        const el = elRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--cine-sx', `${x.toFixed(2)}%`);
        el.style.setProperty('--cine-sy', `${y.toFixed(2)}%`);
        el.style.setProperty('--cine-spot-opacity', '1');
        setPos({ x, y, active: true });
    }, []);

    const onLeave = useCallback(() => {
        const el = elRef.current;
        if (!el) return;
        el.style.setProperty('--cine-spot-opacity', '0');
        setPos((prev) => ({ ...prev, active: false }));
    }, []);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return undefined;

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);

        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, [onMove, onLeave]);

    return { ref: setRef, ...pos };
}

export type TiltOptions = {
    max?: number;
    scale?: number;
    glowSize?: string;
    glowColor?: string;
};

export type TiltApi = {
    ref: RefCallback<HTMLElement>;
    onMouseMove: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: MouseEvent<HTMLElement>) => void;
    style: CSSProperties;
};

export function useTilt(options: TiltOptions = {}): TiltApi {
    const { max = 10, scale = 1.04, glowSize, glowColor } = options;
    const elRef = useRef<HTMLElement | null>(null);
    const [style, setStyle] = useState<CSSProperties>({});

    const setRef = useCallback<RefCallback<HTMLElement>>((el) => {
        elRef.current = el;
    }, []);

    const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
        const el = elRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        setStyle({
            ['--cine-rx' as string]: `${rx.toFixed(2)}deg`,
            ['--cine-ry' as string]: `${ry.toFixed(2)}deg`,
            ['--cine-scale' as string]: String(scale),
            ['--gx' as string]: `${(px * 100).toFixed(2)}%`,
            ['--gy' as string]: `${(py * 100).toFixed(2)}%`
        });
    }, [max, scale]);

    const onMouseLeave = useCallback(() => {
        setStyle({
            ['--cine-rx' as string]: '0deg',
            ['--cine-ry' as string]: '0deg',
            ['--cine-scale' as string]: '1',
            ['--gx' as string]: '50%',
            ['--gy' as string]: '50%'
        });
    }, []);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return undefined;

        if (glowSize) el.style.setProperty('--cine-glow-size', glowSize);
        if (glowColor) el.style.setProperty('--cine-glow-color', glowColor);
    }, [glowSize, glowColor]);

    return { ref: setRef, onMouseMove, onMouseLeave, style };
}
