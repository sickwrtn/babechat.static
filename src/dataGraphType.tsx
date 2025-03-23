import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

//tooltip format
const tooltipFormatter = (value : any, name : any) => {
    if (name === 'isTopActive' && value === 101) {
      return ['100+', name]; // 
    }
    return [value, name];
};

//하루 증가량 그래프 컴포넌트
export function DcdGraph({data,color}:{data:Array<any>,color: string}){
    if (!data || data.length === 0) {
        return (
        <>
            <div>데이터가 없습니다. 1일 이상 지나야 추가됩니다.</div>
        </>
    );
    }
    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip />
                <XAxis dataKey="label"/>
                <YAxis tickFormatter={formatYAxis} domain={['auto', 'auto']} />
                <Line type="monotone" dataKey="data" stroke={color} strokeWidth={2} dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    </>
        )
}

//데이터 그래프 컴포넌트
export function DataGraph({data,dataKey,color}:{data:Array<any>,dataKey: string,color: string}){
    if (!data || data.length === 0) {
        return (
        <>
            <div>데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
    );
    }
    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip />
                <XAxis dataKey="label"/>
                <YAxis tickFormatter={formatYAxis} domain={['auto', 'auto']} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </>
        )
}


//순위 그래프 컴포넌트
export function DataTopGraph({data,dataKey,color}:{data:Array<any>,dataKey: string,color: string}){
    if (!data || data.length === 0) {
        return (
        <>
            <div>데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
    );
    }
    var data = data.map(i=>{
        if (i.isTopActive == null){
            i.isTopActive = 101;
        }
        return {
            label : i.label,
            chatCount: i.chatCount,
            likeCount : i.likeCount,
            commentCount : i.commentCount,
            isTopActive : i. isTopActive
        } as any
    })

    const yTicks = [0, 20, 40, 60, 80, 99, 101];

    return (
    <>
        <ResponsiveContainer height={300} width="100%">
            <LineChart data={data}>
                <Tooltip formatter={tooltipFormatter} />
                <XAxis dataKey="label" />
                <YAxis ticks={yTicks} tickFormatter={tickFormatter} domain={[1, 100]} reversed={true}/>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </>
        )
}