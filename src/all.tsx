import { useEffect, useState } from 'react';
import { DataGraph, DcdGraph, RankDataGraph } from './dataGraphType'
import { Response, Rank } from './interfaces'
import './main.css'

interface dataSet{
    label: string;
    chatCount: number;
    likeCount: number;
    commentCount: number;
    characterCount: number;
}

interface dataz{
    name: string;
    datas: Array<dataSet>;    
}

interface reponse<T>{
    result: string;
    data: T
}

//주기 필터
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

//하루 증가량 계산
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

/*
function DataTrans(dataSet: Array<dataSet>,func: (data: Array<dataSet>,index: number)=> number){
    var result: Array<{label: string; data: number}> = [];
    for (let index = 0; index < dataSet.length - 1; index++) {
        result.push({
            label: dataSet[index].label,
            data: func(dataSet,index)
        })
    }
    return result
}
*/

function All(){
    //load된 캐릭터 데이터
    const [data,setData] = useState([] as Array<any>);
    //현재 선택된 주기
    const [period,setPeriod] = useState("7d" as '1d' | '7d' | '30d' | 'all');

    const [characterCount, setCharacterCount] = useState(0);
    const [chatCount, setChatCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [rank, setRank] = useState([] as Rank[]);
    useEffect(()=>{
        document.getElementById("logo")?.addEventListener('click',()=>{
            window.location.href = "/";
        })
        fetch(`https://babe-api.fastwrtn.com/all`)
        .then(res => res.json())
        .then((data: reponse<dataz>) => {
            setData(data.data.datas);
            setChatCount(data.data.datas[data.data.datas.length - 1].chatCount);
            setLikeCount(data.data.datas[data.data.datas.length - 1].likeCount);
            setCommentCount(data.data.datas[data.data.datas.length - 1].commentCount);
        })
        fetch(`https://babe-api.fastwrtn.com/count`)
        .then(res => res.json())
        .then((data: reponse<number>) => setCharacterCount(data.data))
        fetch("https://babe-api.fastwrtn.com/rank")
            .then(res => res.json())
            .then((data: Response<Rank[]>) => setRank(data.data))
    },[]);
    const onChangeSelect = (e: any) => {
        setPeriod(e.target.value);
    }
    return (
    <>
        <div className = "wr-m">
            <h2 className='search-target'>총집계 결과</h2>
            <select name="period" id="period" className="p-3" onChange={onChangeSelect}>
                <option value="1d">1일</option>
                <option value="7d" selected>7일</option>
                <option value="30d">30일</option>
                <option value="all">전체기간</option>
            </select>
        </div>
        <fieldset className="border p-3">
            <p className="h5 mb-3">등록된 캐릭터수 : {characterCount.toLocaleString()}</p>
            <p className="h5 mb-3">총 채팅수 : {chatCount.toLocaleString()}</p>
            <p className="h5 mb-3">총 좋아요수 : {likeCount.toLocaleString()}</p>
            <p className="h5 mb-3">총 댓글수 : {commentCount.toLocaleString()}</p>
            <small className='h5 mb-3 text-muted'>등록된 캐릭터들의 총집계 입니다.</small>
        </fieldset>
        <div>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">등록된 캐릭터수</legend>
                    <DataGraph data={filterDataByPeriod(data, period)} dataKey='characterCount' color='blue'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 등록된 캐릭터수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].characterCount - i[j].characterCount)} color='blue' />
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">총 채팅수 변동량(10분)</legend>
                    <DataGraph data={filterDataByPeriod(data.map((data)=>({...data, nnChatCount: data.nnChatCount > 0 ? data.nnChatCount : null})), period)} dataKey='nnChatCount' color='blue' />
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 채팅수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].chatCount - i[j].chatCount)} color='blue'/>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">총 좋아요수 변동량(10분)</legend>
                    <DataGraph data={filterDataByPeriod(data.map((data)=>({...data, nnLikeCount: data.nnLikeCount > 0 ? data.nnLikeCount : null})), period)} dataKey="nnLikeCount" color='red'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 좋아요수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].likeCount - i[j].likeCount)} color='red'/>
                </div>
            </fieldset>
            <fieldset className="d-flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">총 댓글수 변동량(10분)</legend>
                    <DataGraph data={filterDataByPeriod(data.map((data)=>({...data, nnCommentCount: data.nnCommentCount > 0 ? data.nnCommentCount : null})), period)} dataKey="nnCommentCount" color='purple'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 댓글수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].commentCount - i[j].commentCount)} color='purple' />
                </div>
            </fieldset>
            <fieldset className="border p-3">
                <div>
                    <legend className="h5 mb-3">TOP 10 기록 (10분)</legend>
                    <RankDataGraph data={rank}></RankDataGraph>
                </div>
            </fieldset>

        </div>
    </>
    )
}

export default All