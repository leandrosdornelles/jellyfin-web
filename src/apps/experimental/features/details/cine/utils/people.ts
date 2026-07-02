import type { CastMember } from '../types';

export function filterCast(people: CastMember[] | null | undefined, limit = 8): CastMember[] {
    if (!people) return [];
    return people
        .filter((p) => p.Type === 'Actor' || !p.Type)
        .slice(0, limit);
}

export function filterCrew(people: CastMember[] | null | undefined, types: string[] = ['Director', 'Writer', 'Producer']): CastMember[] {
    if (!people) return [];
    return people.filter((p) => p.Type && types.includes(p.Type));
}

export function getPersonHref(person: CastMember): string | undefined {
    return person.Id ? `/cinedetails?id=${encodeURIComponent(person.Id)}` : undefined;
}

export function getCrewLabel(type: string): string {
    switch (type) {
        case 'Director': return 'Diretor';
        case 'Writer': return 'Roteiro';
        case 'Producer': return 'Produtor';
        default: return type;
    }
}
