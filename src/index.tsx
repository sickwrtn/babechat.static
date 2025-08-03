import { useEffect, useState } from 'react';
import './main.css'
import { RankData, Rank , Response } from './interfaces';
import { JSX } from 'react/jsx-dev-runtime';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form } from 'react-bootstrap';

const dataTrans = async (data : Response<Rank[]>): Promise<Array<[string,number]>> => {
  const rank: any = {};
  for (let index = 1; index < 11; index++) {
    rank[`${index}`] = [];
  }
  data.data.forEach((i:Rank) => {
    i.datas.forEach((i:RankData) => {
      rank[`${i.rank}`].push(i.characterId);
    });
  })
  const ReRank: any = {}
  let total = 0;
  for (let index = 1; index < 11; index++) {
    rank[`${index}`].forEach((i: string) => {
      if(ReRank[`${i}`] == undefined){
        ReRank[`${i}`] = 1;
      }
      else {
        ReRank[`${i}`] += 1;
      }
      total += 1;
    })
  }
  const ReRankTo: any = {};
  for (let i = 0; i < Object.keys(ReRank).length; i++) {
    ReRankTo[Object.keys(ReRank)[i]] = ReRank[Object.keys(ReRank)[i]] / total;
  }
  const result: any = [];
  Object.keys(ReRankTo).forEach((i: any) => {
    result.push([i,ReRankTo[i]]);
  })
  return result;
}

function Index ({isDarkmode,isDarkmodeOnChange}:{isDarkmode: boolean,isDarkmodeOnChange: (e:any)=>void}): JSX.Element {
    //검색 쿼리

    const [query, setquery] = useState('');

    const [rank, setRank] = useState([] as Array<[string,number]>);
    
    useEffect(()=>{
      fetch("https://babe-api.fastwrtn.com/rank")
        .then(res => res.json())
        .then((data: Response<Rank[]>) => dataTrans(data))
        .then(d => setRank(d!.sort((a: [string,number],b: [string,number]) => b[1] - a[1]).slice(0,10)));
    },[])

    // 검색 바 참조
    if (!localStorage.getItem("searchData")){
      localStorage.setItem("searchData",JSON.stringify([]));
    }

    if (JSON.parse(localStorage.getItem("searchData") as string)){
      const searchData: Array<string> = JSON.parse(localStorage.getItem("searchData") as string);
      localStorage.setItem("searchData",JSON.stringify(searchData.reverse().slice(0,10).reverse()));
    }

    const onChange = (event: any): void => {
        setquery(event.target.value)							
    }

    const okEvent = (query: string): void => {
        const searchData = JSON.parse(localStorage.getItem("searchData") as string);
        searchData.push(query);
        localStorage.setItem("searchData",JSON.stringify(searchData));
        window.location.href = `/search?q=${query}`;
    }

    return (<>
        <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="캐릭터 이름" aria-label="캐릭터 이름" aria-describedby="button-addon2" onChange={onChange} onKeyDown={(e)=>{
                                if (e.key == "Enter"){
                                    okEvent(query);
                                }
                            }}></input>
          <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={()=>okEvent(query)}>검색</button>
        </div>
        <div className='overflow-hidden' style={{whiteSpace:"nowrap"}}>
          { (JSON.parse(localStorage.getItem("searchData") as string).length > 0) &&
          <div className='d-flex'>
            <p style={{marginRight:"10px"}}>최근검색 : </p>
            {
            JSON.parse(localStorage.getItem("searchData") as string).reverse().map((i: string) => (
              <p style={{marginRight:"10px", cursor : "pointer"}} onClick={()=>{
                window.location.href = `/search?q=${i}`;
              }}>#{i}</p>
            ))}
          </div>}
          <Form.Check // prettier-ignore
              style={{cursor:"default"}}
              type="switch"
              className='mb-3'
              label="다크모드"
              checked={isDarkmode}
              onChange={isDarkmodeOnChange}
          />
        </div>
        <div className="sidebar-wrapper border">
          <div className='p-2'>
            <h4 className="sidebar-text">일일 TOP10 점유율</h4>
            {rank.map((i:[string,number]) => (
              <>
                <div className='sidebar-list d-flex'>
                  <p className='sidebar-int'>{(i[1] * 100).toFixed(2)}%</p>
                  <p className='sidebar-name'>{i[0]}</p>
                </div>
              </>
            ))}
          </div>
        </div>
        <div className="wrapper">
            <p className='wrapper-in IP' style={{cursor:"pointer"}} onClick={()=>{window.location.href = "/all"}}>총 집계 보기 (클릭)</p>
        </div>
      </>)
}

export default Index