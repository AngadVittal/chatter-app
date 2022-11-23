import React, { useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';
import '../styles/_messages.scss';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const bottomRef = useRef();
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] =useState([{user: 'bot',id: 0, message: initialBottyMessage}]);

  useEffect(() => {
    socket.on('bot-typing', () => {
      setIsTyping(true);
    });

    socket.on('bot-message', (response) => {
      setIsTyping(false);
      setMessageList(messageList => [...messageList,{user: 'bot',id: messageList.length, message: response}]);
      setLatestMessage("bot",response);
      playReceive();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      socket.off('bot-typing');
      socket.off('bot-message');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('user-message',message);
    setMessageList(messageList => [...messageList,{user: 'me',id: messageList.length, message: message}]);
    setLatestMessage("bot",message);
    playSend();
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  
  const onChangeMessage = (ev) => {
    setMessage(ev.target.value);
  }

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
      { messageList.map((message, ind) => <Message key = {ind} nextMessage={ind!=messageList.length-1 ? messageList[ind+1] : null} message={message} botTyping={isTyping}/>) }
      { isTyping? <TypingMessage/> : null}
      <div ref={bottomRef} />
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
