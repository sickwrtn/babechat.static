import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Search from "./search"
import Statistics from './statistics';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Search />} />
                <Route path="/statistics/:charId" element={<Statistics />} />
            </Routes>
        </Router>
    )
}

export default App