import { useEffect, useRef, useState } from 'react'
import './search.css'
import { useSearchParams } from 'react-router-dom';

function Search(){
  const [query, setquery] = useState('');
  const [characterData, setCharacterData] = useState(Array<any>);
  const characterDataRef = useRef(characterData);
  useEffect(() => {
    characterDataRef.current = characterData; // 상태 업데이트 시 ref 업데이트
  }, [characterData]);
  const [params] = useSearchParams();
  const q = params.get('q') as string;
  function onChange(event: any){								
      setquery(event.target.value)							
  }

  function searchEvent(query: string){
    window.location.href = `/search?q=${query}`;
  }

  function loadMore(data: any){
    let wait = setInterval(()=>{
      if (data.data,length == 0){
        clearInterval(wait);
      }
      const target = document.getElementById(data.data[data.data.length - 1].id)
      if (target != null){
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            // 대상 요소가 화면에 나타났는지 확인
            if (entry.isIntersecting) {
              // 데이터를 로딩하는 코드를 작성하면 돼요.
              fetch(`https://babe-api.fastwrtn.com/search?q=${encodeURI(q)}&sort=popular&limit=10&offset=${characterDataRef.current.length}`)
                .then(res => res.json())
                .then((new_data: any)=>{
                  if (data.data.length == 0){
                    return
                  }
                  const new_characterData: any[] = [];
                  characterDataRef.current.forEach((i: any)=>{
                    new_characterData.push(i);
                  })
                  new_data.data.forEach((i: any) => {
                    new_characterData.push(i);
                  });
                  setCharacterData(new_characterData);
                  loadMore(new_data);
                });
              // 더 이상 관찰할 필요가 없으면 관찰을 중지
              observer.unobserve(target);
            }
          });
        });
        // 대상 요소 관찰 시작
        observer.observe(target);
        clearInterval(wait);
      }
    })
  }

  useEffect(()=>{
    document.getElementById("logo")?.addEventListener('click',()=>{
      window.location.href = "/";
    })
    fetch(`https://babe-api.fastwrtn.com/search?q=${encodeURI(q)}&sort=popular&limit=10&offset=0`)
      .then(res => res.json())
      .then((data: any)=>{
        setCharacterData(data.data);
        loadMore(data);
      });
  },[]);
  
  function registEvent(characterId: string){
    fetch(`https://babe-api.fastwrtn.com/regist?charId=${characterId}`,)
      .then(res => res.json())
      .then((data: any)=>{
        if (data.result != "FAIL") {
          alert("등록되었습니다.")
          window.location.reload();
        }
        else {alert(data.data)};
      });
  }
  function okEvent(characterId: string){
    window.location.href = `/statistics/${characterId}`
  }



  function Check(character: any){
    if(character.log){
      return (
      <>
        <div className="card card-size border-success" id={character.id}>
          <img src={character.mainImage} className="card-img-top card-img-extra" alt="..."></img>
          <div className="card-body">
            <h5 className="card-title">{character.name}</h5>
            <p className="card-text">{character.description}</p>
            <button className="btn btn-success" onClick={()=>okEvent(character.id)}>통계 확인</button>
          </div>
        </div>
      </>
    )
    }
    else{
      return (
        <>
          <div className="card card-size border-danger" id={character.id}>
            <img src={character.mainImage} className="card-img-top card-img-extra" alt="..."></img>
            <div className="card-body">
              <h5 className="card-title">{character.name}</h5>
              <p className="card-text">{character.description}</p>
              <button className="btn btn-danger" onClick={()=>registEvent(character.id)}>통계 등록</button>
            </div>
          </div>
        </>
      )
    }
  }
  return (
    <>
      <div className="input-group mb-3">
        <input id="search" type="text" className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2" onChange={onChange}></input>
        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => searchEvent(query)}>검색</button>
      </div>
      <h2 className='search-target'>'{q}'의 검색결과</h2>
      <div className="row" id="character">
        {characterData.map((character: any)=>Check(character))}
      </div>
    </>
  )
}

export default Search
