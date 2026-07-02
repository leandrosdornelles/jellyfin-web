import React, { createElement, useCallback, type ChangeEvent, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useParallax, useSpotlight, useTilt, type TiltOptions } from './hooks';

import './cinematic.scss';

export type CineRevealTag = 'div' | 'span' | 'section' | 'header' | 'footer' | 'main'
    | 'article' | 'aside' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'p' | 'a' | 'button' | 'li' | 'ul' | 'nav';

export type CineRevealProps = Readonly<{
    as?: CineRevealTag;
    delay?: number | string;
    className?: string;
    children?: ReactNode;
}>;

export function CineReveal({ as = 'div', delay, className, children }: CineRevealProps) {
    const style: CSSProperties = delay !== undefined ?
        { '--cine-delay': typeof delay === 'number' ? `${delay}s` : delay } as CSSProperties :
        {};
    return createElement(as, {
        className: ['cineReveal', className].filter(Boolean).join(' '),
        style
    }, children);
}

function escapeAttr(value: string): string {
    return value.replace(/'/g, '%27').replace(/\)/g, '%29');
}

export type CineArtProps = Readonly<{
    imageUrl?: string;
    gradient?: string;
    className?: string;
    style?: CSSProperties;
}>;

export function CineArt({ imageUrl, gradient, className, style }: CineArtProps) {
    let backgroundImage: string | undefined;
    if (imageUrl) backgroundImage = `url('${escapeAttr(imageUrl)}')`;
    else if (gradient) backgroundImage = gradient;
    return (
        <div
            className={['cineArtFake', className].filter(Boolean).join(' ')}
            style={backgroundImage ? { ...style, backgroundImage } : style}
        />
    );
}

export type CinePillProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CinePill({ children, className }: CinePillProps) {
    return (
        <span className={['cinePill', className].filter(Boolean).join(' ')}>
            {children}
        </span>
    );
}

export type CineMetaRowProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CineMetaRow({ children, className }: CineMetaRowProps) {
    return (
        <div className={['cineHeroMeta', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export type CineMetaItemProps = Readonly<{
    children: ReactNode;
    strong?: boolean;
    badge?: boolean;
    quality?: boolean;
    amber?: boolean;
    red?: boolean;
    className?: string;
}>;

export function CineMetaItem({
    children,
    strong,
    badge,
    quality,
    amber,
    red,
    className
}: CineMetaItemProps) {
    const classes = [
        strong && 'cineHeroMetaStrong',
        badge && 'cineHeroMetaBadge',
        quality && 'cineHeroMetaQuality',
        amber && 'cineHeroMetaAmber',
        red && 'cineHeroMetaRed',
        className
    ].filter(Boolean).join(' ');
    return <span className={classes}>{children}</span>;
}

export function CineMetaDot() {
    return <span className='cineHeroMetaDot'>•</span>;
}

export type CineEdgeRowProps = Readonly<{
    title: string;
    seeAllHref?: string;
    onSeeAll?: () => void;
    seeAllLabel?: string;
    className?: string;
    children: ReactNode;
    mask?: 'right' | 'right-wide' | 'none';
}>;

export function CineEdgeRow({
    title,
    seeAllHref,
    onSeeAll,
    seeAllLabel = 'Ver tudo',
    className,
    children,
    mask = 'right-wide'
}: CineEdgeRowProps) {
    const maskClass = {
        right: 'cineMaskRight',
        'right-wide': 'cineMaskRightWide',
        none: ''
    }[mask];
    let seeAll: ReactNode = null;
    if (seeAllHref) {
        seeAll = <Link to={seeAllHref} className='cineSeeAll'>{seeAllLabel}</Link>;
    } else if (onSeeAll) {
        seeAll = <button type='button' className='cineSeeAll' onClick={onSeeAll}>{seeAllLabel}</button>;
    }
    return (
        <section className={className}>
            <div className='cineSectionTitleRow'>
                <h2 className='cineSectionTitle'>{title}</h2>
                {seeAll}
            </div>
            <div className={['cineEdgeScroller', maskClass].filter(Boolean).join(' ')}>
                {children}
            </div>
        </section>
    );
}

export type CineSidebarItem = Readonly<{
    icon: ReactNode;
    label: string;
    href: string;
    key?: string;
}>;

export type CineSidebarProps = Readonly<{
    items: ReadonlyArray<CineSidebarItem>;
    activeIndex?: number;
    logoHref?: string;
    logoContent?: ReactNode;
    className?: string;
}>;

export function CineSidebar({
    items,
    activeIndex,
    logoHref,
    logoContent,
    className
}: CineSidebarProps) {
    return (
        <aside className={['cineSidebar', className].filter(Boolean).join(' ')}>
            {logoContent && logoHref && (
                <Link to={logoHref} className='cineSidebarLogo' title='Início'>
                    {logoContent}
                </Link>
            )}
            {logoContent && !logoHref && (
                <div className='cineSidebarLogo' aria-hidden='true'>
                    {logoContent}
                </div>
            )}
            <nav className='cineSidebarNav'>
                {items.map((item, i) => (
                    <Link
                        key={item.key ?? `${item.href}-${i}`}
                        to={item.href}
                        className={['cineSidebarButton', i === activeIndex ? 'cineSidebarButtonActive' : ''].filter(Boolean).join(' ')}
                        title={item.label}
                        aria-label={item.label}
                    >
                        {item.icon}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

export type CineShellProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CineShell({ children, className }: CineShellProps) {
    return (
        <div className='cineRoot cineFrame'>
            <div className={['cineShell', className].filter(Boolean).join(' ')}>
                {children}
            </div>
        </div>
    );
}

export type CineHeroBackProps = Readonly<{
    backTo?: string;
    onBack?: () => void;
    label?: string;
}>;

export function CineHeroBack({ backTo, onBack, label = '← Voltar' }: CineHeroBackProps) {
    if (backTo) {
        return <Link to={backTo} className='cineHeroBack'>{label}</Link>;
    }
    if (onBack) {
        return <button type='button' className='cineHeroBack' onClick={onBack}>{label}</button>;
    }
    return null;
}

export type CineHeroProps = Readonly<{
    backdrop: ReactNode;
    backTo?: string;
    onBack?: () => void;
    parallaxFactor?: number;
    className?: string;
    children: ReactNode;
}>;

export function CineHero({
    backdrop,
    backTo,
    onBack,
    parallaxFactor = 0.25,
    className,
    children
}: CineHeroProps) {
    const parallax = useParallax({ factor: parallaxFactor });
    const spotlight = useSpotlight();

    return (
        <section
            ref={spotlight.ref}
            className={['cineHero', className].filter(Boolean).join(' ')}
        >
            <div ref={parallax.ref} className='cineHeroParallax'>
                <div className='cineHeroArt'>
                    {backdrop}
                </div>
            </div>
            <div className='cineHeroSpot' />
            <div className='cineHeroFadeBottom' />
            <div className='cineHeroFadeLeft' />
            <CineHeroBack {...(backTo ? { backTo } : {})} {...(onBack ? { onBack } : {})} />
            <div className='cineHeroContent'>
                {children}
            </div>
        </section>
    );
}

export type CineEyebrowProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CineEyebrow({ children, className }: CineEyebrowProps) {
    return (
        <span className={['cineHeroEyebrow', className].filter(Boolean).join(' ')}>
            {children}
        </span>
    );
}

export type CineTitleProps = Readonly<{
    children: ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3';
}>;

export function CineTitle({ children, className, as = 'h1' }: CineTitleProps) {
    return createElement(as, {
        className: ['cineHeroTitle', className].filter(Boolean).join(' ')
    }, children);
}

export function CineTagline({ children, className }: CineEyebrowProps) {
    return (
        <p className={['cineHeroTagline', className].filter(Boolean).join(' ')}>
            {children}
        </p>
    );
}

export type CineBackLinkProps = Readonly<{
    to: string;
    children: ReactNode;
    className?: string;
}>;

export function CineBackLink({ to, children, className }: CineBackLinkProps) {
    return (
        <Link to={to} className={['cineBackLink', className].filter(Boolean).join(' ')}>
            {children}
        </Link>
    );
}

export type CinePosterProps = Readonly<{
    art: ReactNode;
    className?: string;
    small?: boolean;
}>;

export function CinePoster({ art, className, small }: CinePosterProps) {
    return (
        <div className={['cinePosterWrap', className].filter(Boolean).join(' ')}>
            <div className='cinePosterGlow' />
            <div className={['cinePoster', small ? 'cinePosterSmall' : ''].filter(Boolean).join(' ')}>
                {art}
            </div>
        </div>
    );
}

export type CineThumbProps = Readonly<{
    art: ReactNode;
    playIcon?: ReactNode;
    wide?: boolean;
    onClick?: () => void;
    href?: string;
    className?: string;
    children?: ReactNode;
}>;

export function CineThumb({
    art,
    playIcon = '▶',
    wide,
    onClick,
    href,
    className,
    children
}: CineThumbProps) {
    const thumbClasses = ['cineThumb', wide ? 'cineThumbWide' : ''].filter(Boolean).join(' ');
    const content = (
        <>
            {art}
            <div className='cineThumbPlay'>
                <span className={['cineThumbPlayBtn', wide ? '' : 'cineThumbPlayBtnSmall'].filter(Boolean).join(' ')}>
                    {playIcon}
                </span>
            </div>
            {children}
        </>
    );
    const wrapClasses = ['cineThumbLink', className].filter(Boolean).join(' ');
    if (href) {
        return (
            <Link to={href} className={wrapClasses}>
                <div className={thumbClasses}>{content}</div>
            </Link>
        );
    }
    if (onClick) {
        return (
            <button type='button' className={wrapClasses} onClick={onClick}>
                <div className={thumbClasses}>{content}</div>
            </button>
        );
    }
    return (
        <div className={wrapClasses}>
            <div className={thumbClasses}>{content}</div>
        </div>
    );
}

export type CineActionsProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CineActions({ children, className }: CineActionsProps) {
    return (
        <div className={['cineHeroActions', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export type CineCtaProps = Readonly<{
    children: ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'ghost' | 'icon';
    className?: string;
}>;

export function CineCta({ children, onClick, href, variant = 'primary', className }: CineCtaProps) {
    const classes = [
        variant === 'primary' ? 'cineCtaPrimary' : 'cineCtaGhost',
        variant === 'icon' ? 'cineCtaIcon' : '',
        className
    ].filter(Boolean).join(' ');

    if (href) {
        return <Link to={href} className={classes}>{children}</Link>;
    }
    return <button type='button' className={classes} onClick={onClick}>{children}</button>;
}

export type CineContentGridProps = Readonly<{
    children: ReactNode;
    aside: ReactNode;
    className?: string;
}>;

export function CineContentGrid({ children, aside, className }: CineContentGridProps) {
    return (
        <div className={['cineContentGrid', className].filter(Boolean).join(' ')}>
            <div className='cineContentMain'>{children}</div>
            <div className='cineContentAside'>{aside}</div>
        </div>
    );
}

export type CineSectionTitleProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CineSectionTitle({ children, className }: CineSectionTitleProps) {
    return (
        <h2 className={['cineSectionTitle', className].filter(Boolean).join(' ')}>
            {children}
        </h2>
    );
}

export type CinePillRowProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function CinePillRow({ children, className }: CinePillRowProps) {
    return (
        <div className={['cinePillRow', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export type CinePanelProps = Readonly<{
    title: string;
    children: ReactNode;
    className?: string;
}>;

export function CinePanel({ title, children, className }: CinePanelProps) {
    return (
        <div className={['cineSidebarPanel', className].filter(Boolean).join(' ')}>
            <h3 className='cinePanelTitle'>{title}</h3>
            {children}
        </div>
    );
}

export type CineSelectProps = Readonly<{
    label: string;
    value?: string;
    options: ReadonlyArray<{ value: string; label: string }>;
    onChange?: (value: string) => void;
    className?: string;
}>;

export function CineSelect({ label, value, options, onChange, className }: CineSelectProps) {
    const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    }, [onChange]);

    return (
        <label className={['cineSelectLabel', className].filter(Boolean).join(' ')}>
            <span className='cineSelectCaption'>{label}</span>
            <select
                className='cineSelect'
                value={value}
                onChange={onChange ? handleChange : undefined}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </label>
    );
}

export type CineTechListProps = Readonly<{
    items: ReadonlyArray<readonly [string, string]>;
    className?: string;
}>;

export function CineTechList({ items, className }: CineTechListProps) {
    return (
        <dl className={['cineTechList', className].filter(Boolean).join(' ')}>
            {items.map(([k, v]) => (
                <div key={k} className='cineTechItem'>
                    <dt className='cineTechKey'>{k}</dt>
                    <dd className='cineTechVal'>{v}</dd>
                </div>
            ))}
        </dl>
    );
}

export type CineTechLinkItem = Readonly<{
    label: string;
    href?: string;
    onClick?: () => void;
}>;

export type CineTechLinksProps = Readonly<{
    links: ReadonlyArray<CineTechLinkItem>;
    className?: string;
}>;

export function CineTechLinks({ links, className }: CineTechLinksProps) {
    return (
        <div className={['cineTechLinks', className].filter(Boolean).join(' ')}>
            {links.map((link) => (
                link.href ?
                    (
                        <a
                            key={link.label}
                            className='cineTechLink'
                            href={link.href}
                            target='_blank'
                            rel='noreferrer noopener'
                        >
                            {link.label}
                        </a>
                    ) :
                    (
                        <button
                            key={link.label}
                            type='button'
                            className='cineTechLink'
                            onClick={link.onClick}
                        >
                            {link.label}
                        </button>
                    )
            ))}
        </div>
    );
}

export type CineCardProps = Readonly<{
    art: ReactNode;
    title: ReactNode;
    sub?: ReactNode;
    badge?: ReactNode;
    quality?: ReactNode;
    href?: string;
    onClick?: () => void;
    shape?: 'portrait' | 'landscape' | 'landscape-wide';
    className?: string;
}>;

export function CineCard({
    art,
    title,
    sub,
    badge,
    quality,
    href,
    onClick,
    shape = 'portrait',
    className
}: CineCardProps) {
    const widthClass = {
        portrait: 'cineCardPortrait',
        landscape: 'cineCardLandscape',
        'landscape-wide': 'cineCardLandscapeWide'
    }[shape];
    const artClass = ['cineCardArt', shape !== 'portrait' ? 'cineCardArtLandscape' : ''].filter(Boolean).join(' ');
    const body = (
        <>
            <div className={artClass}>
                {art}
                {badge && <span className='cineCardBadge'>{badge}</span>}
                {quality && <span className='cineCardQuality'>{quality}</span>}
            </div>
            <div className='cineCardBody'>
                <p className='cineCardTitle'>{title}</p>
                {sub && <p className='cineCardSub'>{sub}</p>}
            </div>
        </>
    );
    const classes = ['cineCard', widthClass, className].filter(Boolean).join(' ');
    if (href) {
        return <Link to={href} className={classes}>{body}</Link>;
    }
    if (onClick) {
        return <button type='button' className={classes} onClick={onClick}>{body}</button>;
    }
    return <div className={classes}>{body}</div>;
}

export type CineCastCardProps = Readonly<{
    imageUrl?: string;
    gradient?: string;
    name: ReactNode;
    role?: ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
}>;

export function CineCastCard({
    imageUrl,
    gradient,
    name,
    role,
    href,
    onClick,
    className
}: CineCastCardProps) {
    const backgroundImage = imageUrl ?
        `url('${escapeAttr(imageUrl)}')` :
        gradient;
    const body = (
        <>
            <div
                className='cineCastAvatar'
                style={backgroundImage ? { backgroundImage } : undefined}
            />
            <p className='cineCastName'>{name}</p>
            {role && <p className='cineCastRole'>{role}</p>}
        </>
    );
    const classes = ['cineCard', 'cineCastCard', className].filter(Boolean).join(' ');
    if (href) {
        return <Link to={href} className={classes}>{body}</Link>;
    }
    if (onClick) {
        return <button type='button' className={classes} onClick={onClick}>{body}</button>;
    }
    return <div className={classes}>{body}</div>;
}

export type TiltCardProps = Readonly<{
    children: ReactNode;
    className?: string;
    max?: number;
    scale?: number;
    glowSize?: string;
    glowColor?: string;
}>;

export function TiltCard({ children, className, max, scale, glowSize, glowColor }: TiltCardProps) {
    const options: TiltOptions = {};
    if (max !== undefined) options.max = max;
    if (scale !== undefined) options.scale = scale;
    if (glowSize !== undefined) options.glowSize = glowSize;
    if (glowColor !== undefined) options.glowColor = glowColor;
    const tilt = useTilt(options);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
        tilt.onMouseMove(e);
    }, [tilt]);
    const handleMouseLeave = useCallback((e: MouseEvent<HTMLElement>) => {
        tilt.onMouseLeave(e);
    }, [tilt]);

    return (
        <div
            className={['cineTiltOuter', className].filter(Boolean).join(' ')}
        >
            <div
                ref={tilt.ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className='cineTilt'
                style={tilt.style}
            >
                {children}
                <div className='cineTiltGlow' />
            </div>
        </div>
    );
}

export type CineNextUpProps = Readonly<{
    art: ReactNode;
    eyebrow: ReactNode;
    title: ReactNode;
    meta?: ReactNode;
    href: string;
    className?: string;
}>;

export function CineNextUp({ art, eyebrow, title, meta, href, className }: CineNextUpProps) {
    return (
        <Link to={href} className={['cineNextUpCard', className].filter(Boolean).join(' ')}>
            <div className='cineNextUpThumb'>{art}</div>
            <div className='cineNextUpBody'>
                <span className='cineNextUpEyebrow'>{eyebrow}</span>
                <p className='cineNextUpTitle'>{title}</p>
                {meta && <p className='cineNextUpMeta'>{meta}</p>}
            </div>
        </Link>
    );
}

export type CineEpisodeRowProps = Readonly<{
    art: ReactNode;
    number: ReactNode;
    title: ReactNode;
    duration?: ReactNode;
    rating?: ReactNode;
    endsAt?: ReactNode;
    description?: ReactNode;
    onInfo?: () => void;
    onWatched?: () => void;
    onFavorite?: () => void;
    href: string;
    className?: string;
}>;

export function CineEpisodeRow({
    art,
    number,
    title,
    duration,
    rating,
    endsAt,
    description,
    onInfo,
    onWatched,
    onFavorite,
    href,
    className
}: CineEpisodeRowProps) {
    const handleInfo = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onInfo?.();
    }, [onInfo]);
    const handleWatched = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onWatched?.();
    }, [onWatched]);
    const handleFavorite = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onFavorite?.();
    }, [onFavorite]);

    return (
        <Link to={href} className={['cineEpisodeRow', className].filter(Boolean).join(' ')}>
            <div className='cineEpisodeThumb'>{art}</div>
            <div className='cineEpisodeBody'>
                <h3 className='cineEpisodeTitle'>{number}. {title}</h3>
                <div className='cineEpisodeMeta'>
                    {duration}
                    {duration && (rating || endsAt) && <CineMetaDot />}
                    {rating && <CineMetaItem amber>{`★ ${rating}`}</CineMetaItem>}
                    {rating && endsAt && <CineMetaDot />}
                    {endsAt && <span>Termina às {endsAt}</span>}
                </div>
                {description && <p className='cineEpisodeDesc'>{description}</p>}
            </div>
            <div className='cineEpisodeActions'>
                {onInfo && (
                    <button type='button' className='cineEpisodeIcon' onClick={handleInfo} aria-label='Informações'>ⓘ</button>
                )}
                {onWatched && (
                    <button type='button' className='cineEpisodeIcon' onClick={handleWatched} aria-label='Marcar como visto'>✓</button>
                )}
                {onFavorite && (
                    <button type='button' className='cineEpisodeIcon' onClick={handleFavorite} aria-label='Favoritar'>♥</button>
                )}
            </div>
        </Link>
    );
}
