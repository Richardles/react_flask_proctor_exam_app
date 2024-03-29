import React from 'react';
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
        <Route path="/" exact component={Login}/>
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
        <Route path="/home/class_view/" exact>
          <Home data="manage class"/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
