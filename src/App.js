import logo from './logo.svg';
import './App.css';
import Routes from './Routes';
import {Router} from 'react-router-dom'
function App() {

  const signOut = () => {
    localStorage.clear();
    window.location.replace('/login');
  };

  const childProps = {
    isAuthenticated: true,
    // signOut: signOut()
  }
  return (
    <Routes childProps={childProps} />
  );
}

export default App;
