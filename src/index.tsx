import { useState } from 'react';
import './search.css'
function Index(){
    const [query, setquery] = useState('');
    function onChange(event: any){								
        setquery(event.target.value)							
    }
    function okEvent(query: string){
        window.location.href = `/search?q=${query}`;
    }
    return (<>
        <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2" onChange={onChange}></input>
          <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={()=>okEvent(query)}>검색</button>
        </div>
      </>)
}

export default Index