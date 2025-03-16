import { useEffect, useState } from 'react'
import './search.css'

function Search(){
  const [query, setquery] = useState('');
  const [characterData, setCharacterData] = useState([])
  function onChange(event: any){								
      setquery(event.target.value)							
  }

  function onClick(){
    const babechat_api_url = import.meta.env.VITE_APP_BABECHAT_API_URL;
    console.log(babechat_api_url)
    fetch(`https://babe-api.fastwrtn.com/search?q=${encodeURI(query)}&sort=popular&limit=20`)
      .then(res => res.json())
      .then((data: any)=>{setCharacterData(data.data);});
}

function registEvent(characterId: string){
  fetch(`https://babe-api.fastwrtn.com/regist?charId=${characterId}`,)
    .then(res => res.json())
    .then(()=>{alert("등록되었습니다.")});
}

function okEvent(characterId: string){
  window.location.href = `/statistics/${characterId}`
}

useEffect(()=>{
  
},[])

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
        <input type="text" className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2" onChange={onChange}></input>
        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={onClick}>검색</button>
      </div>
      <div className="row" id="character">
        {characterData.map((character: any)=>Check(character))}
      </div>
    </>
  )
}

export default Search
