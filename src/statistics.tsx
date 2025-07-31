import { useParams } from 'react-router-dom';
import './main.css'
import { useEffect, useState } from 'react';
import { DataGraph, DataPlotGraph, DataTopGraph, DcdGraph } from './dataGraphType';
import { Character, CharacterData, Response } from './interfaces';
import { setStrict } from './strict';

//주기 필터
function filterDataByPeriod<T>(data : Array<T>, period : '1d' | '7d' | '30d' | 'all') {
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
const dcd = setStrict((dataSet: Array<CharacterData>,func: (data: Array<CharacterData>,index: number)=> number): any => {
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
})

function Statistics() {
    //load된 캐릭터 데이터
    const [data,setData] = useState(Array<CharacterData>);
    //캐릭터 이름
    const [name,setName] = useState("");
    //현재 선택된 주기
    const [period,setPeriod] = useState("7d" as '1d' | '7d' | '30d' | 'all');
    //params
    const params = useParams();
    useEffect(()=>{
        document.getElementById("logo")?.addEventListener('click',()=>{
            window.location.href = "/";
        })
        fetch(`https://babe-api.fastwrtn.com/character?charId=${params.charId}`)
        .then(res => res.json())
        .then((data: Response<Character>) => {
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
            <DataPlotGraph data={filterDataByPeriod<CharacterData>(data, period)} dataKey={["likeCount","chatCount"]} />
            <fieldset className="flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">실시간 순위 기록</legend>
                    <DataTopGraph data={filterDataByPeriod<CharacterData>(data, period)} dataKey='isTopActive' color='blue'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">신작 순위 기록</legend>
                    <p>추가 예정</p>
                </div>
            </fieldset>
            <fieldset className="flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">채팅수</legend>
                    <DataGraph data={filterDataByPeriod<CharacterData>(data, period)} dataKey='chatCount' color='blue' />
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 채팅수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].chatCount - i[j].chatCount)} color='blue'/>
                </div>
            </fieldset>
            <fieldset className="flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">좋아요수</legend>
                    <DataGraph data={filterDataByPeriod<CharacterData>(data, period)} dataKey='likeCount' color='red'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 좋아요수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].likeCount - i[j].likeCount)} color='red'/>
                </div>
            </fieldset>
            <fieldset className="flex border p-3">
                <div className='graph-size'>
                    <legend className="h5 mb-3">댓글수</legend>
                    <DataGraph data={filterDataByPeriod<CharacterData>(data, period)} dataKey='commentCount' color='purple'/>
                </div>
                <div className='graph-size'>
                    <legend className="h5 mb-3">일일 댓글수 변동량</legend>
                    <DcdGraph data={dcd(data,(i,j)=>i[j+1].commentCount - i[j].commentCount)} color='purple' />
                </div>
            </fieldset>
        </div>
    </>
    )
}

export default Statistics