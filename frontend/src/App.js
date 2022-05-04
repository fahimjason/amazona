import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';

function App() {
    return (
        <BrowserRouter>
            <div>
                <header>
                    <header>
                        <Link to="/">amazona</Link>
                    </header>
                    <main>
                        <Routes>
                            <Route path='/product/:slug' element={<ProductScreen />} />
                            <Route path='/' element={<HomeScreen />} />
                        </Routes>
                    </main>
                </header>
            </div>
        </BrowserRouter>
    );
}

export default App;
