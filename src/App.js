import logo from './logo.svg';
import './App.css';
import Routes from './Routes';
import {Router} from 'react-router-dom'
function App() {


  const signOut = () => {
    // localStorage.clear();
    // this.setState({ isAuthenticating: false, ready: true });
    // if(isLocalhost) {
      window.location.replace('/login')
    // }else{
      // window.location.replace(`${OKTA_PROVIDER}/oauth2/sign_out?rd=https://expediagroup.okta.com/login/signout`);
    // }
  };

  const childProps = {
    isAuthenticated: false,
    // signOut: signOut()
  }
  return (
    <Routes childProps={childProps} />
  );
}

export default App;
