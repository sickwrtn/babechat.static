export interface CharacterData{
    label: string;
    chatCount: number;
    likeCount: number;
    commentCount: number;
    isTopActive: number;
    isTopNew: number;
}

export interface RankData{
    rank: number;
    characterId: string;
}

export interface Rank{
    label: string;
    datas: Array<RankData>
}

export interface CharacterDcdData{
    label: string;
    data: number;
}

export interface Character{
    name: string;
    datas: Array<CharacterData>;    
}

export interface Response<T>{
    result: string;
    data: T
}