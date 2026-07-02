import type { MediaSourceInfo } from '@jellyfin/sdk/lib/generated-client/models/media-source-info';
import type { MediaStream } from '@jellyfin/sdk/lib/generated-client/models/media-stream';

const CODEC_LABELS: Record<string, string> = {
    hevc: 'HEVC',
    h264: 'H.264',
    h265: 'H.265',
    av1: 'AV1',
    vp9: 'VP9',
    opus: 'OPUS',
    aac: 'AAC',
    ac3: 'AC3',
    eac3: 'EAC3',
    truehd: 'TrueHD',
    dts: 'DTS'
};

export interface MediaFormat {
    resolution?: string;
    codec?: string;
    hdr?: string;
    quality: string;
}

function getHeightLabel(height: number | null | undefined): string | undefined {
    if (!height) return undefined;
    if (height >= 2100) return '4K';
    if (height >= 1400) return '1440p';
    if (height >= 1000) return '1080p';
    if (height >= 700) return '720p';
    if (height >= 470) return '480p';
    return undefined;
}

function getWidthLabel(width: number | null | undefined): string | undefined {
    if (!width) return undefined;
    if (width >= 3800) return '4K';
    if (width >= 1900) return '1080p';
    if (width >= 1200) return '720p';
    return undefined;
}

function getResolutionLabel(width: number | null | undefined, height: number | null | undefined): string | undefined {
    if (!height && !width) return undefined;
    return getHeightLabel(height) ?? getWidthLabel(width);
}

function getVideoStream(mediaSource: MediaSourceInfo | undefined): MediaStream | undefined {
    if (!mediaSource?.MediaStreams) return undefined;
    return mediaSource.MediaStreams.find((s) => s.Type === 'Video');
}

function getHdrLabel(stream: MediaStream | undefined): string | undefined {
    const flags = stream?.VideoRange ?? stream?.VideoRangeType;
    if (!flags) return undefined;
    if (typeof flags === 'string') {
        const upper = flags.toUpperCase();
        if (upper.includes('DOLBY') || upper.includes('VISION')) return 'Dolby Vision';
        if (upper.includes('HDR10PLUS')) return 'HDR10+';
        if (upper.includes('HDR10')) return 'HDR10';
        if (upper.includes('HLG')) return 'HLG';
        if (upper.includes('HDR')) return 'HDR';
    }
    return undefined;
}

export function getMediaFormat(mediaSource: MediaSourceInfo | undefined): MediaFormat {
    const video = getVideoStream(mediaSource);
    const resolution = getResolutionLabel(video?.Width, video?.Height);
    const codec = video?.Codec ? CODEC_LABELS[video.Codec.toLowerCase()] || video.Codec.toUpperCase() : undefined;
    const hdr = getHdrLabel(video);

    const parts: string[] = [];
    if (resolution) parts.push(resolution);
    if (codec) parts.push(codec);
    if (hdr) parts.push(hdr);

    return {
        resolution,
        codec,
        hdr,
        quality: parts.join(' ') || (mediaSource ? 'Vídeo' : '')
    };
}

export function getAudioStreamLabel(stream: MediaStream | undefined): string {
    if (!stream) return '';
    const codec = stream.Codec ? stream.Codec.toUpperCase() : '';
    const channels = stream.Channels ? `${stream.Channels}ch` : '';
    const lang = stream.Language || '';
    const isDefault = stream.IsDefault ? 'Padrão' : '';
    const parts = [lang, codec, channels, isDefault].filter(Boolean);
    return parts.join(' · ') || stream.DisplayTitle || stream.Title || 'Áudio';
}

export function getSubtitleStreamLabel(stream: MediaStream | undefined, isOff = false): string {
    if (isOff) return 'Desativado';
    if (!stream) return '';
    const lang = stream.Language || '';
    const codec = stream.Codec ? stream.Codec.toUpperCase() : '';
    const isForced = stream.IsForced ? 'Forçada' : '';
    const isDefault = stream.IsDefault ? 'Padrão' : '';
    const parts = [lang, codec, isForced, isDefault].filter(Boolean);
    return parts.join(' · ') || stream.DisplayTitle || stream.Title || 'Legenda';
}

export function pickPrimaryAudio(streams: MediaStream[] | null | undefined): MediaStream | undefined {
    if (!streams?.length) return undefined;
    const found = streams.find((s) => s.Type === 'Audio' && s.IsDefault)
        || streams.find((s) => s.Type === 'Audio');
    return found;
}

export function pickPrimarySubtitle(streams: MediaStream[] | null | undefined): MediaStream | undefined {
    if (!streams?.length) return undefined;
    const found = streams.find((s) => s.Type === 'Subtitle' && s.IsDefault && !s.IsForced)
        || streams.find((s) => s.Type === 'Subtitle' && !s.IsForced)
        || streams.find((s) => s.Type === 'Subtitle');
    return found;
}

export function getPrimaryMediaSource(sources: MediaSourceInfo[] | null | undefined): MediaSourceInfo | undefined {
    if (!sources?.length) return undefined;
    return sources[0];
}
