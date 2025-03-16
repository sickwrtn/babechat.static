import { useParams } from 'react-router-dom';
import './search.css'
import { Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts'
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

function dcdCheck(data: Array<any>){
    if (!data || data.length === 0) {
        return (
        <>
            <div>데이터가 없습니다. 1일 이상 지나야 추가됩니다.</div>
        </>
    );
    }
    return (
    <>
        <LineChart width={500} height={300} data={data}>
            <Tooltip />
            <XAxis dataKey="label"/>
            <YAxis domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="data" stroke="red" />
        </LineChart>
    </>
        )
}

function dataCheck(data: Array<any>,dataKey: string){
    if (!data || data.length === 0) {
        return (
        <>
            <div>데이터가 없습니다. 10분마다 추가됩니다.</div>
        </>
    );
    }
    return (
    <>
        <LineChart width={500} height={300} data={data}>
            <Tooltip />
            <XAxis dataKey="label"/>
            <YAxis domain={['auto', 'auto']} />
            <Line type="monotone" dataKey={dataKey} stroke="red" />
        </LineChart>
    </>
        )
}

function Statistics() {
    const [data,setData] = useState(Array<dataSet>);
    const params = useParams();
    useEffect(()=>{
        document.getElementById("logo")?.addEventListener('click',()=>{
            window.location.href = "/";
        })
        fetch(`https://babe-api.fastwrtn.com/character?charId=${params.charId}`)
        .then(res => res.json())
        .then((data: reponse<dataz>) => {
            setData(data.data.datas);
        })
    },[]);
    return (
    <>
        <div>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">채팅수</legend>
                {dataCheck(data,"chatCount")}
            </fieldset>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">일일 채팅수 증가량</legend>
                {dcdCheck(dcd(data,(i,j)=>{
                    return i[j+1].chatCount - i[j].chatCount;
                }))}
            </fieldset>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">좋아요수</legend>
                {dataCheck(data,"likeCount")}
            </fieldset>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">일일 좋아요수 증가율</legend>
                {dcdCheck(dcd(data,(i,j)=>{
                    return i[j+1].likeCount - i[j].likeCount;
                }))}
            </fieldset>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">댓글수</legend>
                {dataCheck(data,"commentCount")}
            </fieldset>
            <fieldset className="border p-3">
                <legend className="h5 mb-3">일일 댓글수 증가율</legend>
                {dcdCheck(dcd(data,(i,j)=>{
                    return i[j+1].commentCount - i[j].commentCount;
                }))}
            </fieldset>
        </div>
    </>
    )
}

export default Statistics