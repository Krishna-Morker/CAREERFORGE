import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendMessageRoute, recieveMessageRoute ,host } from "../utils/APIRoutes";
import musicaudio from "./ting_iphone.mp3";

export default function ChatContainer({ currentChat, socket ,reArrangeContact}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () =>{
      const dat = await axios.get(`${host}/login/sucess`, { withCredentials: true });

      const response = await axios.post(recieveMessageRoute, {
        from: dat.data.user._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    }
    fetchData();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const dat = await axios.get(`${host}/login/sucess`, { withCredentials: true });
    const data =dat.data.user;
    socket.emit("send-msg", {
      cat:" from ",
      naf:data.username,
      to: currentChat._id,
      from: data._id,
      msg,
    });
    socket.emit("send-noti", {
      cat:" from ",
      naf:data.username,
      to: currentChat._id,
      from: data._id,
      msg,
    });
    
   
    reArrangeContact(currentChat._id);
    
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
   
  };

  useEffect(() => {
    if (socket) {
      socket.on("msg-recieve", (data) => {
        // if(data.from==currentChat._id)
        // {
        //   setArrivalMessage({ fromSelf: false, message: data.msg });
        // }

      const audio =new Audio(musicaudio);
      audio.play().catch(console.warn);
        setArrivalMessage({ fromSelf: false, message: data.msg });
        reArrangeContact(data.from);
      });
      
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
    <Container>
      <div className="chat-header">
        <div className="user-details" onClick={()=>navigate(`/profile/${currentChat.username}`)}>
          <div className="avatar">
            <img
              src={currentChat.avatarImage}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor:pointer;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;