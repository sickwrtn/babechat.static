export interface CharacterData{
    label: string;
    chatCount: number;
    likeCount: number;
    commentCount: number;
    isTopActive: number;
    isTopNew: number;
}

export interface CharacterDcdData{
    label: string;
    data: number;
}

export interface Character{
    name: string;
    datas: Array<CharacterData>;    
}

export interface Reponse<T>{
    result: string;
    data: T
}