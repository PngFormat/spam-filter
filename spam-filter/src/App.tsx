import React from 'react';
import ChatRoom from './components/ChatRoom';
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  return (
      <div>
          <Header/>
        <h1>Spam Filter App</h1>
        <ChatRoom />
          <Footer/>
      </div>
  );
};

export default App;