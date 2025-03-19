import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Error from './error';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/*" element={<Error />}></Route>
            </Routes>
        </Router>
    )
}

/**
 * <Route path="/" element={<Index/>} />
    <Route path="/search" element={<Search />} />
    <Route path="/statistics/:charId" element={<Statistics />} />
 */

export default App