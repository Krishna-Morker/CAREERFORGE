import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import app_logo from "../../assets/logo.svg";
import axios from 'axios';
import Logout from "../Logout";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchModal from "../Search_Modal";
import { SearchUsers, setnotifi, getnotifi } from '../../utils/APIRoutes';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import socket from "../socket";
import notificationSound from '../ting_iphone.mp3';
import {
  AiOutlineHome,
  AiOutlineUserSwitch,
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlineBell,
} from "react-icons/ai";
import { BsBriefcase } from "react-icons/bs";
import "./index.css";

toast.configure();
let n=0;
export default function Topbar( { currentUser } ) {

  const [currentUserImage,setCurrentUserImage] = useState(undefined);
  const [modalOpen,setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState({btn:false,btn1:false});
  const [filteredData, setFilteredData] = useState(undefined);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [sh,setsh]=useState(false);
  const [h,seth]=useState();
  const [notificationCount,setnotificationCount]=useState(0);


  const handleMenuOpen = (event) => {
    setAnchorEl({[event.target.id] : event.currentTarget});
  }; 

  const handleMenuClose = (e) => {
    setAnchorEl({[e.target.name] : false});
  };
  function handleNavAndClose(e) {
    handleMenuClose(e);
  }


  useEffect(() => {
    const fetchData = async () => {
      if(currentUser && query!='')
      {
        const response = await axios.get(`${SearchUsers}/${currentUser._id}`, { params: { query: query } });
        setFilteredData(response.data);
      }
      else if(query=='')
        setFilteredData(undefined);
    };
    fetchData();
  }, [query,currentUser]);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
  };


  const handleButtonClick = (name) => {
    setModalOpen(false);
    navigate(`/profile/${name}`);
    setQuery('');
  };
  useEffect(() => {
    if (currentUser) {
      
      socket.emit("add-user", currentUser._id);
     // socket.emit("setup", currentUser._id);
    }
  }, [currentUser]);
 
  useEffect(() => {

    //Listen for new notifications
    const storedCount = localStorage.getItem('notificationCount');
    if (storedCount) {
      setnotificationCount(parseInt(storedCount, 10));
    }

    socket.on("newNotification", (notifi) => {

      const audio=new Audio(notificationSound);
     audio.play().catch(console.warn);
   
     toast.success('New Notification Check it', {
      position: toast.POSITION.TOP_RIGHT
    })
    n++;
   
    setnotificationCount((p) => p+1);
   
    
    // console.log(localStorage.getItem('notificationCount'),"free")
      setNotifications((prevNotifications) => [notifi, ...prevNotifications]);
      localStorage.setItem('notificationCount', JSON.stringify(notificationCount+1));
     
    });
    return () => {
      socket.off('newNotification');
    };
    
  });
  // useEffect(() => {
  //   // Retrieve notification count from local storage when component mounts
  //   const fetch =async()=>{
  //   const storedCount = localStorage.getItem('notificationCount');
  //   if (storedCount) {
  //     setnotificationCount(parseInt(storedCount, 10));

  //     console.log(localStorage.getItem('notificationCount'),"free")
  //   }
  // }
  // fetch();
  // },);
  useEffect(() => {
    const fetchNotifications = async () => {
      
      if(currentUser!=undefined){
        
      try {
        const response = await axios.post(getnotifi, {
          userid: currentUser._id, // Replace with the actual user ID or get it dynamically
        });
        console.log(response.data.notifications.length,"kll");
        setNotifications(response.data.notifications);
        setnotificationCount(response.data.notifications.length)
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } 
    };
  }
  
    fetchNotifications();
  }, [currentUser]); // The empty dependency array ensures that this effect runs once when the component mounts
  



  const fun = async ()=>{
    setsh((old)=>(!old));
    const response = await axios.post(setnotifi, {
      userid: currentUser._id, // Replace with the actual user ID or get it dynamically
    });
    localStorage.removeItem('notificationCount');
    setnotificationCount(0);
   
  }


  useEffect(() => {
    if(currentUser){
      setCurrentUserImage(currentUser.avatarImage);
    }
  }, [currentUser]);

  return (<>
    <div className="top-main">
      <div className="react-icons">
      <img src={app_logo} alt="app_logo" className="app-logo" onClick={()=>navigate("/home")}/>
        <div className="icon-container">
          <AiOutlineSearch onClick={()=>setModalOpen(true)} size={30} className="react-icon" />
            <SearchModal 
              modalOpen={modalOpen} 
              setModalOpen={setModalOpen} 
              query={query} 
              setQuery={setQuery}
              filteredData={filteredData }
              handleInputChange={handleInputChange}
              handleButtonClick={handleButtonClick}
            />
          <span className="icon-name">Search</span>
        </div>
        <div className="icon-container">
            <AiOutlineHome size={30} className="react-icon" onClick={()=>navigate("/home")}/>
          <span className="icon-name">Home</span>
        </div>
        <div className="icon-container">
          <AiOutlineUserSwitch size={30} className="react-icon" id="btn" onClick={handleMenuOpen} />
          <span className="icon-name">Connections</span>
        </div>
        
        <Menu

                anchorEl={anchorEl.btn}
                open={Boolean(anchorEl.btn)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={(e)=>handleNavAndClose}
                  component={Link}
                  to="/connections/connection"
                >
                  Connections
                </MenuItem>
                <MenuItem
                  onClick={(e)=>handleNavAndClose}
                  component={Link}
                  to="/connections/addfriend"
                >
                  Add friend
                </MenuItem>
                <MenuItem
                  onClick={(e)=>handleNavAndClose}
                  component={Link}
                  to="/pending"
                >
                  New Request
                </MenuItem>
              </Menu>

        <div className="icon-container">
          <BsBriefcase size={30} className="react-icon" id="btn1" onClick={handleMenuOpen}/>
                <span className="icon-name">Jobs</span>
          <Menu
                anchorEl={anchorEl.btn1}
                open={Boolean(anchorEl.btn1)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={handleNavAndClose}
                  component={Link}
                  to="/job-portal"
                >
                  Start search
                </MenuItem>
                <MenuItem
                  onClick={handleNavAndClose}
                  component={Link}
                  to="/post-job"
                >
                  Post a Job
                </MenuItem>
                <MenuItem
                  onClick={handleNavAndClose}
                  component={Link}
                  to="/allPostedJobs"
                >
                 My Posted Jobs
                </MenuItem>
                <MenuItem
                  onClick={handleNavAndClose}
                  component={Link}
                  to="/allAppliedJobs"
                >
                  My Applied Jobs
                </MenuItem>
              </Menu>
        </div>
        <div className="icon-container">

            <AiOutlineMessage size={30} className="react-icon" onClick={()=>navigate("/chat")}/>
          <span className="icon-name">Message</span>
        </div>
        <div className="icon-container">
        <AiOutlineBell size={30} className="react-icon"  onClick={fun}/>
        <span className="icon-name">Notification</span>
        
        {notificationCount > 0 && (
         <div className="notification-badge">   
              <span className="badge">    
                  {notificationCount}
              </span>    
          </div>
          )}
      

        </div>
       
        <div className="icon-container">
          <img className="user-logo" src={currentUserImage} alt="user" onClick={()=>navigate(`/profile/${currentUser.username}`)}/>
          <span className="icon-name">Profile</span>
        </div>
        <Logout />
      </div>
    </div>
             
  {(sh==true) && 
    <>
      {/* component */}
     
    
      <div
        className="contain"
        id="chec-div"
        style={{position: "fixed",zIndex:1}}
      >
        
        <div
          className="main-contain"
          id="notification"
        >
          <div className="notifi">
            <div className="notif-sec">
              <p
                tabIndex={0}
                className="notif-text"
              >
                Notifications
              </p>
              <button
                role="button"
                aria-label="close modal"
                className="notif-btn"//may
                onClick={fun}
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="#4B5563"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="#4B5563"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
              
            {notifications.map(item=>{
  return(<>
  <Link >
  <div className="notif-item">
              <div
                tabIndex={0}
                aria-label="post icon"
                role="img"
                className="ind-item"
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.30325 12.6667L1.33325 15V2.66667C1.33325 2.48986 1.40349 2.32029 1.52851 2.19526C1.65354 2.07024 1.82311 2 1.99992 2H13.9999C14.1767 2 14.3463 2.07024 14.4713 2.19526C14.5963 2.32029 14.6666 2.48986 14.6666 2.66667V12C14.6666 12.1768 14.5963 12.3464 14.4713 12.4714C14.3463 12.5964 14.1767 12.6667 13.9999 12.6667H4.30325ZM5.33325 6.66667V8H10.6666V6.66667H5.33325Z"
                    fill="#4338CA"
                  />
                </svg>
              </div>
              <div className="pl-3">
                <p tabIndex={0} className="item-mess">
      <span className="messa">{item.message}</span>
                </p>
                <p
                  tabIndex={0}
                  className="time"
                >
                 {item.timestamp}
                </p>
              </div>
            </div>
            </Link>
  </>)
})}

            <div className="com">
            <p className="jkl">
              <span
              >
                No Notifications for now :)
              </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>}
    </>
  );
}
