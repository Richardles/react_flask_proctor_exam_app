import React from 'react';
import './App.css';
import Login from './pages/Login';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import Home from './pages/Home'

// App.get('/cors', (req, res) => {
//   res.set('Access-Control-Allow-Origin', '*');
//   res.send({ "msg": "This has CORS enabled 🎈" })
// })

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
        <Route path="/home/schedule/:classCourseId" exact>
          <Home data="class view"/>
        </Route>
        <Route path="/home/schedule/:classCourseId/:studentNumber" exact>
          <Home data="student view"/>
        </Route>
        <Route path="/home/backup" exact>
          <Home data="backup"/>
        </Route>
        <Route path="/home/manage_case/" exact>
          <Home data="manage case"/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
