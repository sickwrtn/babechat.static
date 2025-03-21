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

function filterDataByPeriod(data : any, period : '1d' | '7d' | '30d' | 'all') {
    const now = new Date();
    let startDate;
  
    switch (period) {
      case '1d': // 1일
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d': // 7일
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d': // 30일
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all': // 전체 기간
        return data;
      default:
        return data;
    }
  
    return data.filter((item: any) => {
      const itemDate = new Date(item.label);
      return itemDate >= startDate;
    });
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

    // Y축 틱 포맷터
    const tickFormatter = (value : any) => {
        return value < 100 ? value : '100+';
    };
    const tooltipFormatter = (value : any, name : any) => {
        if (name === 'isTopActive' && value === 101) {
          return ['100+', name]; // "99+" 문자열 표시
        }
        return [value, name]; // 나머지 값은 그대로 표시
    };

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

function Statistics() {
    const [data,setData] = useState(Array<dataSet>);
    const [name,setName] = useState("");
    const [period,setPeriod] = useState("7d" as '1d' | '7d' | '30d' | 'all');
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
    const onChangeSelect = (e: any) => {
        setPeriod(e.target.value);
    }
    return (
    <>
        <div className = "wr-m">
            <h2 className='search-target'>'{name}'의 통계 결과</h2>
            <select name="period" id="period" className="p-3" onChange={onChangeSelect}>
                <option value="1d">1일</option>
                <option value="7d" selected>7일</option>
                <option value="30d">30일</option>
                <option value="all">전체기간</option>
            </select>
        </div>
        <div>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">실시간 순위 기록(isTopActive : 순위)</legend>
                    {dataTopCheck(filterDataByPeriod(data, period),"isTopActive","blue")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">신작 순위 기록(isTopNew : 순위)</legend>
                    <p>추가 예정</p>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">채팅수</legend>
                    {dataCheck(filterDataByPeriod(data, period),"chatCount","blue")}
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
                    {dataCheck(filterDataByPeriod(data, period),"likeCount","red")}
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
                    {dataCheck(filterDataByPeriod(data, period),"commentCount","purple")}
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 댓글수 증가량</legend>
                    {dcdCheck(dcd(data,(i,j)=>{
                        return i[j+1].commentCount - i[j].commentCount;
                    }),"purple")}
                </div>
            </fieldset>
        </div>
        <div className="wrapper">
            <h1 className='wrapper-in'>패치내역 : 통계 범위 선택 추가 (1d, 7d, 30d, all)</h1>
        </div>
    </>
    )
}

export default Statistics