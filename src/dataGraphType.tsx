import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {CharacterData, CharacterDcdData, Rank, RankData} from "./interfaces"
import chroma from 'chroma-js';
import { setStrict } from "./strict";
import { JSX } from "react/jsx-runtime";

//k format
const formatYAxis = (tick: number): string => {
    if (tick >= 1000) {
      return `${tick / 1000}k`;
    }
    return String(tick);
};

// 100+ format
const tickFormatter = (value : any) => {
    return value < 100 ? value : '100+';
};

const tooltipFomatterLocal = (value : number, name : any) => {
    switch(name){
        case "chatCount":
            return [value.toLocaleString(), "채팅수"]
        case "likeCount":
            return [value.toLocaleString(), "좋아요수"]
        case "commentCount":
            return [value.toLocaleString(), "댓글수"]
        case "data":
            return [value.toLocaleString(), "변동량"]
        case "characterCount":
            return [value.toLocaleString(), "캐릭터수"]
        case "nnChatCount":
            return [value.toLocaleString(), "변동량"]
        case "nnLikeCount":
            return [value.toLocaleString(), "변동량"]
        case "nnCommentCount":
            return [value.toLocaleString(), "변동량"]
    }
    return [value.toLocaleString(),name]
}

//tooltip format
const tooltipFormatterTop = (value : any, name : any) => {
    if (name === 'isTopActive' && value === 101) {
      return ['100+', "순위"]; // 
    }
    return [value + "위", "순위"];
};

const tooltipFormatterRank = (value : any, name : any) => [value + "위", name];

//하루 증가량 그래프 컴포넌트
export const DcdGraph = setStrict(({data,color}:{data:Array<CharacterDcdData>,color: string}): JSX.Element => {
    if (!data || data.length === 0) {
        return (
        <>
            <div className="no-data">데이터가 없습니다. 1일 이상 지나야 추가됩니다.</div>
        </>
    );
    }
    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip formatter={tooltipFomatterLocal}/>
                <XAxis dataKey="label"/>
                <YAxis tickFormatter={formatYAxis} domain={['auto', 'auto']} />
                <Line type="monotone" dataKey="data" stroke={color} strokeWidth={2} dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    </>
        )
});

//데이터 그래프 컴포넌트
export const DataGraph = setStrict(({data,dataKey,color}:{data:Array<any>,dataKey: string,color: string}): JSX.Element => {
    if (!data || data.length === 0) {
        return (
        <>
            <div className="no-data">데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
        );
    }
    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip formatter={tooltipFomatterLocal}/>
                <XAxis dataKey="label"/>
                <YAxis tickFormatter={formatYAxis} domain={['auto','auto']} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </>
        )
});


//순위 그래프 컴포넌트
export const DataTopGraph = setStrict(({data,dataKey,color}:{data:Array<CharacterData>,dataKey: string,color: string}): JSX.Element => {
    if (!data || data.length === 0) {
        return (
        <>
            <div className="no-data">데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
    );
    }
    var data: Array<CharacterData> = data.map(i=>{
        if (i.isTopActive == null){
            i.isTopActive = 101;
        }
        return {
            label : i.label,
            chatCount: i.chatCount,
            likeCount : i.likeCount,
            commentCount : i.commentCount,
            isTopActive : i. isTopActive,
            isTopNew: i.isTopNew
        } as any
    })

    const yTicks = [0, 20, 40, 60, 80, 99, 101];

    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip formatter={tooltipFormatterTop} />
                <XAxis dataKey="label" />
                <YAxis ticks={yTicks} tickFormatter={tickFormatter} domain={[1, 100]} reversed={true}/>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </>
        )
})

export const RankDataGraph = setStrict(({data}:{data: Rank[]}) => {
    if (!data || data.length === 0) {
        return (
        <>
            <div className="no-data">데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
    );
    }
    const reData: Array<any> = [];
    const nameList: Array<string> = [];
    data.forEach((i: Rank) => {
        let m: any = {label:i.label};
        i.datas.forEach((j: RankData) => {
            if (!nameList.includes(j.characterId)){
                nameList.push(j.characterId)
            }
            m[j.characterId] = j.rank;
        })
        reData.push(m);
    })
    const yTicks: number[] = [1,2,3,4,5,6,7,8,9,10];
    const colors = chroma.scale(['#fafa6e', '#0000ff', '#ff0000']).mode('lch').colors(nameList.length); // 색상 범위 조정
    return (
        <>
            <ResponsiveContainer height={500} width="100%">
                <LineChart data={reData}>
                    <Tooltip formatter={tooltipFormatterRank} contentStyle={{ backgroundColor: 'white' }}/>
                    <XAxis dataKey="label"/>
                    <YAxis ticks={yTicks} domain={[1, 10]} reversed={true}/>
                    {nameList.map((i, index) => (
                        <Line type="monotone" dataKey={i} stroke={colors[index]} strokeWidth={5} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </>
    )
})