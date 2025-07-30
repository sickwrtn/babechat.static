import { CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import {CharacterData, CharacterDcdData, Rank, RankData} from "./interfaces"
import chroma from 'chroma-js';
import { setStrict } from "./strict";
import { JSX } from "react/jsx-runtime";
import { linearRegression, rSquared } from "simple-statistics";
import { InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css'; // KaTeX CSS 임포트 필수!
import { Form } from "react-bootstrap";
import { useState } from "react";

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

export const DataPlotGraph = ({ data, dataKey }: { data: Array<CharacterData>, dataKey: ["likeCount"|"chatCount"|"commentCount", "likeCount"|"chatCount"|"commentCount"] }): JSX.Element => {
    if (!data || data.length === 0) {
        return (
        <>
            <div className="no-data">데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
        );
    }
    const xAxisKey = dataKey[0];
    const yAxisKey = dataKey[1];
    const [isRegression,setIsRegression] = useState(true);
    const isRegressionOnChange = (e:any) => setIsRegression(e.target.checked);
    const [isRateRegression, setIsRateRegression] = useState(true);
    const isRateRegressionOnChange = (e:any) => setIsRateRegression(e.target.checked);
    //section 1
    const dataMap = data.map((e) => [e[xAxisKey], e[yAxisKey]]);
    const regression = linearRegression(dataMap);
    const slope = regression.m;
    const intercept = regression.b;
    // X축 데이터의 최소값과 최대값을 사용해야 합니다.
    const maxX = Math.max(...data.map(e => e[xAxisKey]));
    const minX = Math.min(...data.map(e => e[xAxisKey]));
    // 선형 회귀선 데이터를 위한 두 점 생성
    const regressionLineData = [
        // minX와 maxX를 사용하여 y값을 예측
        { likeCount: minX, chatCount: slope * minX + intercept },
        { likeCount: maxX, chatCount: slope * maxX + intercept },
    ];
    const regressionF = (x:number) => slope * x + intercept; 
    //section 2
    const rate = data.map((e,i)=>({x: i, y: e.chatCount / e.likeCount}))
    const rateMap = rate.map((e)=>[e.x,e.y]);
    const rateRegression = linearRegression(rateMap);
    const rate_slope = rateRegression.m;
    const rate_intercept = rateRegression.b;
    const rate_regressionF = (e:number) => rate_slope * e + rate_intercept;
    const rRate = rate.map((e)=>({x: e.x, y: e.y, r:rate_regressionF(e.x)}))

    //section 3

    return (
        <>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">캐릭터 통계 평가</legend>
                    <p>
                        평점 : {rate[rate.length - 1].y.toFixed(3)}
                    </p>
                    <p>
                        성장성 : {((Math.atan(rate_slope) / (Math.PI / 2)) * 100).toFixed(3)}%
                    </p>
                    <p>
                        정체도 : {((1 - rSquared(rateMap,rate_regressionF)) * 100).toFixed(3)}%
                    </p>
                    <p>
                        정체도(보조) : {((1 - rSquared(dataMap,regressionF)) * 100).toFixed(3)}% 
                    </p>
                    <p className="text-muted">
                        *평점 : 높을수록 좋음<br/>
                        *성장성 : 높을수록 좋음 (20~10%면 좋음 10~0% 보통 0~-100% 나쁨)<br/>
                        *정체도 : 낮을수록 좋음 (0~10%면 좋음 10~20% 보통 20~100% 나쁨)<br/>
                        *추천 : 7일 주기로 보는게 가장 정확합니다. 정체도 높으면 지속가능성이 낮아집니다.
                    </p>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">채팅수/좋아요수</legend>
                    <ResponsiveContainer height={300} width="100%">
                        <LineChart data={rRate}>
                            <Tooltip/>
                            <XAxis dataKey="x" domain={["auto","auto"]} />
                            <YAxis tickFormatter={formatYAxis} dataKey="y" domain={["auto", "auto"]} />
                            {isRateRegression && 
                                <Line name="선형회귀" type="monotone" dataKey="r" strokeWidth={1} dot={false} />
                            }
                            <Line name="채팅수/좋아요수" type="monotone" dataKey="y" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">채팅수/좋아요수 산점도</legend>
                    <ResponsiveContainer height={300} width="100%">
                        <ComposedChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey={dataKey[0]} name={dataKey[0]} domain={['auto', 'auto']} />
                            <YAxis tickFormatter={formatYAxis} type="number" dataKey={dataKey[1]} name={dataKey[1]} domain={['auto', 'auto']} />
                            <Tooltip/>
                            <Scatter name="캐릭터 통계" data={data} fill="#8884d8"/>
                            { isRegression &&
                                <Line
                                    dataKey={yAxisKey} // regressionLineData의 y 값을 참조합니다.
                                    name="대화수"
                                    data={regressionLineData}
                                    type="linear"
                                    stroke="#ff0101ff"
                                    strokeWidth={4}
                                    strokeOpacity={0.5}
                                    dot={false}
                                />
                            }
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">선형회귀 분석 (채팅수/좋아요수)</legend>
                    <p>
                        선형회귀 함수 : <InlineMath math={`${rate_slope.toFixed(3)}x + ${rate_intercept.toFixed(3)}`}/>
                    </p>
                    <p>
                        기울기 : <InlineMath math={String(rate_slope)}/>
                    </p>
                    <p>
                        y절편 : <InlineMath math={String(rate_intercept)}/>
                    </p>
                    <p>
                        R-Squard : {((rSquared(rateMap,rate_regressionF)) * 100).toFixed(3)}%
                    </p>
                    <Form.Check // prettier-ignore
                        type="switch"
                        className='mb-3'
                        label="선형회귀 모드"
                        checked={isRateRegression}
                        onChange={isRateRegressionOnChange}
                    />
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">선형회귀 분석 (채팅수/좋아요수 산점도)</legend>
                    <p>
                        선형회귀 함수 : <InlineMath math={`${slope.toFixed(3)}x + ${intercept.toFixed(3)}`}/>
                    </p>
                    <p>
                        기울기 : <InlineMath math={String(slope)}/>
                    </p>
                    <p>
                        y절편 : <InlineMath math={String(intercept)}/>
                    </p>
                    <p>
                        R-Squard : {((rSquared(dataMap,regressionF)) * 100).toFixed(3)}%
                    </p>
                    <Form.Check // prettier-ignore
                        type="switch"
                        className='mb-3'
                        label="선형회귀 모드"
                        checked={isRegression}
                        onChange={isRegressionOnChange}
                    />
                </div>
            </fieldset>
        </>
    );
}

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