import { useState } from 'react';
import './main.css'
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

export const setCookie = (name: string, value: string, options?: any) => {
 	return cookies.set(name, value, {...options}); 
}

export const getCookie = (name: string) => {
 return cookies.get(name); 
}


function Index(){
    //검색 쿼리
    const [query, setquery] = useState('');
    // 검색 바 참조
    if (!localStorage.getItem("searchData")){
      localStorage.setItem("searchData",JSON.stringify([]));
    }
    if (JSON.parse(localStorage.getItem("searchData") as string)){
      const searchData: Array<string> = JSON.parse(localStorage.getItem("searchData") as string);
      localStorage.setItem("searchData",JSON.stringify(searchData.reverse().slice(0,10).reverse()));
    }
    function onChange(event: any){
        setquery(event.target.value)							
    }
    function okEvent(query: string){
        const searchData = JSON.parse(localStorage.getItem("searchData") as string);
        searchData.push(query);
        localStorage.setItem("searchData",JSON.stringify(searchData));
        window.location.href = `/search?q=${query}`;
    }
    return (<>
        <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="캐릭터 이름" aria-label="캐릭터 이름" aria-describedby="button-addon2" onChange={onChange}></input>
          <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={()=>okEvent(query)}>검색</button>
        </div>
        { (JSON.parse(localStorage.getItem("searchData") as string).length > 0) &&
        <div style={{display:"flex"}}>
          <p style={{marginRight:"10px"}}>최근검색 : </p>
          {
          JSON.parse(localStorage.getItem("searchData") as string).reverse().map((i: string) => (
            <p style={{marginRight:"10px", cursor : "pointer"}} onClick={()=>{
              window.location.href = `/search?q=${i}`;
            }}>#{i}</p>
          ))}
        </div>}
        <div className="wrapper">
            <p className='wrapper-in IP' style={{cursor:"pointer"}} onClick={()=>{window.location.href = "/all"}}>총 집계 보기 (클릭)</p>
        </div>
      </>)
}

export default Index