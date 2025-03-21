import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Error from './error';
import Statistics from './statistics';
import Search from './search';
import Index from '.';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index/>} />
                <Route path="/search" element={<Search />} />
                <Route path="/statistics/:charId" element={<Statistics />} />
                <Route path="/*" element={<Error />}></Route>
            </Routes>
        </Router>
    )
}

export default App