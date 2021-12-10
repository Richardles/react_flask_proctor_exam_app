import './App.css';
import Login from './pages/Login';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import Home from './pages/Home'

function App() {

  // useEffect(() => {
  //   fetch('/time').then(res => res.json().then(data => {
  //     setCurrentTime(data.time)
  //   }))
  // }, []);

  return (
    <Router>
      <Switch>
        <Route path="/login" exact component={Login}/>
        <Route path="/home/schedule" exact>
          <Home data="schedule"/>
        </Route>
        <Route path="/home/backup" exact>
          <Home data="backup"/>
        </Route>
        <Route path="/home/download_case" exact>
          <Home data="download case"/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
