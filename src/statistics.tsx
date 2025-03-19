import { useParams } from 'react-router-dom';
import './main.css'
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react';

interface dataSet{
    label: string;
    chatCount: number;
    likeCount: number;
    commentCount: number
}

interface dataz{
    name: string;
    datas: Array<dataSet>;    
}

interface reponse<T>{
    result: string;
    data: T
}

const formatYAxis = (tick: number): string => {
    if (tick >= 1000) {
      return `${tick / 1000}k`;
    }
    return String(tick);
};

function dcd(dataSet: Array<dataSet>,func: (data: Array<dataSet>,index: number)=> number){
    var result: Array<{label: string; data: number}> = [];
    var i = 0;
    for (let index = 0; index < dataSet.length - 1; index++) {
        if (new Date(dataSet[index + 1].label).getDay() != new Date(dataSet[index].label).getDay()){
            result.push({
                label: `${new Date(dataSet[index].label).getFullYear()}-${new Date(dataSet[index].label).getMonth() + 1}-${new Date(dataSet[index].label).getDate()}`,
                data: i
            })
            i = 0;
        }
        i += func(dataSet,index);
    }
    return result;
}


function dcdCheck(data: Array<any>,color: string){
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

function dataCheck(data: Array<any>,dataKey: string, color: string){
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

function dataTopCheck(data: Array<any>,dataKey: string, color: string){
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
                <YAxis tickFormatter={formatYAxis} domain={[0, 1]} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </>
        )
}

function Statistics() {
    const [data,setData] = useState(Array<dataSet>);
    const [name,setName] = useState("");
    const params = useParams();
    useEffect(()=>{
        document.getElementById("logo")?.addEventListener('click',()=>{
            window.location.href = "/";
        })
        fetch(`https://babe-api.fastwrtn.com/character?charId=${params.charId}`)
        .then(res => res.json())
        .then((data: reponse<dataz>) => {
            setName(data.data.name);
            setData(data.data.datas);
        })
    },[]);
    return (
    <>
        <h2 className='search-target'>'{name}'의 통계 결과</h2>
        <div>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">실시간 노출 여부(1: 노출 0: 미노출)</legend>
                    {dataTopCheck(data,"isTopActive","blue")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">신작 노출 여부(1: 노출 0: 미노출)</legend>
                    <p>추가 예정</p>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">채팅수</legend>
                    {dataCheck(data,"chatCount","blue")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 채팅수 증가량</legend>
                    {dcdCheck(dcd(data,(i,j)=>{
                        return i[j+1].chatCount - i[j].chatCount;
                    }),"blue")}
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">좋아요수</legend>
                    {dataCheck(data,"likeCount","red")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 좋아요수 증가량</legend>
                    {dcdCheck(dcd(data,(i,j)=>{
                        return i[j+1].likeCount - i[j].likeCount;
                    }),"red")}
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">댓글수</legend>
                    {dataCheck(data,"commentCount","purple")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 댓글수 증가량</legend>
                    {dcdCheck(dcd(data,(i,j)=>{
                        return i[j+1].commentCount - i[j].commentCount;
                    }),"purple")}
                </div>
            </fieldset>
        </div>
    </>
    )
}

export default Statistics