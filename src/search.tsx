import { useState } from 'react'
import './search.css'

function Search(){
  const [query, setquery] = useState('');
  const [characterData, setCharacterData] = useState([])
  function onChange(event: any){								
    // 매개변수 'event'는 이벤트가 발생한 태그의 정보를 가져온다.
      setquery(event.target.value)							
      // 값이 바뀔때마다 setname으로 name값을 변경해준다.
  }

  function onClick(){
    const babechat_api_url = import.meta.env.VITE_APP_BABECHAT_API_URL;
    console.log(babechat_api_url)
    fetch(`https://babe-api.fastwrtn.com/search?q=${encodeURI(query)}&sort=popular&limit=10`)
      .then(res => res.json())
      .then((data: any)=>{setCharacterData(data.data);console.log(characterData)});
  }

function check(){
  if(true){
    return (<a href="button" className="btn btn-success">통계</a>)
  }
  else{
    return (<a href="button" className="btn btn-danger">통계 등록</a>)
  }
}

  return (
    <>
      <div className="input-group mb-3">
        <input type="text" className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2" onChange={onChange}></input>
        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={onClick}>Button</button>
      </div>
      <div className="row">
        {characterData.map((character: any)=>(
          <div className="card card-size" id={character.id}>
            <img src={character.mainImage} className="card-img-top card-img-extra" alt="..."></img>
            <div className="card-body">
              <h5 className="card-title">{character.name}</h5>
              <p className="card-text">{character.description}</p>
              {check()}
            </div>
          </div>
       ))}
      </div>
    </>
  )
}

export default Search
