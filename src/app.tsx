import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Error from './error';
import Statistics from './statistics';
import Search from './search';
import Index from '.';
import All from './all'
import { useEffect, useState } from 'react';

/*
인생이 tlqkf 억까의 연속이다. 솔직히 개좆같다.
나는 솔직히 음악이 좋고 또 음악을 중점적으로 하면서 살고싶다.
하지만 아무 걱정없이 음악만 하고 살수가 없다.
그나마 다행인건 내가 코딩을 좋아한다는 사실이다.
하지만 코딩과 음악의 우열을 둔다면 창세기의 궁창의 차이일것이다 ㅅㅂ
하 시발 FastWrtn 접고 나서도 api에다가 요청을 날려보는 새끼가 있지를 않나..
서버 비용이 존나 나가질 않나...
Cafe24호스팅만 믿고있다. 제발!!
*/

function App() {
    const [isDarkmode,setIsDarkmode] = useState<boolean>((():boolean =>{
                if (localStorage.getItem("them") == null){
                    localStorage.setItem("them","light");
                    return false
                }
                else if (localStorage.getItem("them") == "light"){
                    return false;
                }
                else if (localStorage.getItem("them") == "dark"){
                    return true;
                }
                return false
            })());

    const isDarkmodeOnChange = (e: any) => setIsDarkmode(e.target.checked);

    useEffect(() => {
        if (isDarkmode){
            localStorage.setItem("them","dark");
            document.documentElement.setAttribute('data-bs-theme', "dark");
        }
        else {
            localStorage.setItem("them","light");
            document.documentElement.setAttribute('data-bs-theme', "light");
        }                              
    }, [isDarkmode]);

    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index isDarkmode={isDarkmode} isDarkmodeOnChange={isDarkmodeOnChange}/>} />
                <Route path="/search" element={<Search isDarkmode={isDarkmode} isDarkmodeOnChange={isDarkmodeOnChange}/>} />
                <Route path="/statistics/:charId" element={<Statistics />} />
                <Route path="/all" element={<All />} />
                <Route path="/*" element={<Error />} />
            </Routes>
        </Router>
    )
}

export default App