import { JSX, useEffect, useRef, useState } from 'react'
import './main.css'
import { useSearchParams } from 'react-router-dom';
import { Form, Modal } from 'react-bootstrap';

function Search({isDarkmode,isDarkmodeOnChange}:{isDarkmode: boolean,isDarkmodeOnChange: (e:any)=>void}): JSX.Element {
  //검색할 쿼리
  const [query, setquery] = useState('');
  //로드된 캐릭터들
  const [characterData, setCharacterData] = useState(Array<any>);
  //characterData Ref
  const characterDataRef = useRef(characterData);
  //현재 Safe 상태인지 unSafe 상태인지
  const [unSafe,setUnSafe] = useState(false);
  
  // modal 이 열려있는지
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false); 
  
  if (!localStorage.getItem("searchData")){
    localStorage.setItem("searchData",JSON.stringify([]));
  }
  if (JSON.parse(localStorage.getItem("searchData") as string)){
    const searchData: Array<string> = JSON.parse(localStorage.getItem("searchData") as string);
    localStorage.setItem("searchData",JSON.stringify(searchData.reverse().slice(0,10).reverse()));
  }

  useEffect(() => {
    characterDataRef.current = characterData; // 상태 업데이트 시 ref 업데이트
  }, [characterData]);
  
  const [params] = useSearchParams();
  const q = params.get('q') as string;
  function onChange(event: any){
      setquery(event.target.value)							
  }

  const searchEvent = (query: string): void => {
    const searchData = JSON.parse(localStorage.getItem("searchData") as string);
    searchData.push(query);
    localStorage.setItem("searchData",JSON.stringify(searchData));
    window.location.href = `/search?q=${query}`;
  }


  useEffect(()=>{
    //로드 추가
    const loadMore = (data: any):void => {
      let wait = setInterval(() => {
        if (data.data.length == 0){
          clearInterval(wait);
        }
        const target = document.getElementById(data.data[data.data.length - 1].id);
        if (target != null){
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
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
                observer.unobserve(target);
              }
            });
          });
          observer.observe(target);
          clearInterval(wait);
        }
      })
    }
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
  
  //캐릭터 등록 이벤트
  const registEvent = (characterId: string):void => {
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

  //통계 확인 이벤트
  const okEvent = (characterId: string):void => {
    window.location.href = `/statistics/${characterId}`
  }

  //언세이프화 이벤트
  const unSafeEvent = ():void => {
    setShow(true)
  }

  //캐릭터 카드 생성
  const CreateCharacterCard = ({character}:{character:any}): JSX.Element => {
    if(character.log){
      return (
      <>
        <div className="card card-size border-success" id={character.id}>
          <div className="soso">
              {(character.isAdult && !unSafe) &&
              <>
                <img src={character.mainImage} className="card-img-top card-img-extra blur" onClick={unSafeEvent} alt="..."></img>
                <img className="overlay-svg" src="https://py27ckpypvqi2sq0.public.blob.vercel-storage.com/assets/svgs/unsafe.svg" alt="Your SVG Image"></img>
              </>}
              {(!character.isAdult || unSafe) &&
              <img src={character.mainImage} className="card-img-top card-img-extra" alt="..."></img>}
          </div>
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
            <div className="soso">
              {(character.isAdult && !unSafe) &&
              <>
                <img src={character.mainImage} className="card-img-top card-img-extra blur" onClick={unSafeEvent} alt="..."></img>
                <img className="overlay-svg" src="https://py27ckpypvqi2sq0.public.blob.vercel-storage.com/assets/svgs/unsafe.svg" alt="Your SVG Image"></img>
              </>}
              {(!character.isAdult || unSafe) &&
              <img src={character.mainImage} className="card-img-top card-img-extra" alt="..."></img>}
            </div>
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
        <input id="search" type="text" className="form-control" placeholder="캐릭터 이름" aria-label="캐릭터 이름" aria-describedby="button-addon2" onChange={onChange} onKeyDown={(e)=>{
                                if (e.key == "Enter"){
                                    searchEvent(query);
                                }
                            }}></input>
        <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => searchEvent(query)}>검색</button>
      </div>
      <div className='d-sm-flex overflow-hidden' style={{whiteSpace:"nowrap"}}>
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
              type="switch"
              className='mb-3 ms-sm-auto'
              label="다크모드"
              checked={isDarkmode}
              onChange={isDarkmodeOnChange}
          />
      </div>
      <h2 className='search-target'>'{q}'의 검색결과</h2>
      <div className="row" id="character">
        {characterData.map((character: any)=>
          <CreateCharacterCard character={character}/>)}
      </div>
      {
        <Modal show={show} onHide={handleClose} size='sm' centered>
          <h3 className='modal-h2'>Are you 18 years of age or older?</h3>
          <p className='modal-p'>you must be 18 years or older and agree to our Underage Policy to access and use this website. By clicking Congfirm below, you certify that you are 19 years or older and that you accept our Underage Policy.</p> 
          <button className='btn btn-success btn-modal-yes' onClick={() => {setUnSafe(true); handleClose()}}>
            네
          </button>
          <button className='btn btn-danger btn-modal-no' onClick={() => handleClose()}>
            아니오
          </button>
        </Modal>
      }
    </>
  )
}

export default Search
