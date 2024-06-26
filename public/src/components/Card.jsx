import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { host, getJobPosterById, getSignature, addApplicantDetails, addAppliedJob, getStatusOfJobApplication ,jobemail } from "../utils/APIRoutes";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import '../pages/JobStyle.css';
import Loading from '../assets/loading.gif'

const Card = ({ data, currentUser }) => {
  const { _id, companyName, companyLogo, minPrice, maxPrice, salaryType, jobLocation, employmentType, jobPostingDate, jobDescription, jobTitle } = data;
  const [jobPoster, setJobPoster] = useState(undefined);
  const [image,setImage] = useState(null);
  const navigate = useNavigate();
  const [isApplied,setIsApplied] = useState(undefined);
  const [isDisable, setIsDisable] = useState(false)
  const [ApplicationStatus, setApplicationStatus] = useState("");

  const getStatusOfJob = async () => {
    try{
    console.log(currentUser);
    const res = await axios.get(`${getStatusOfJobApplication}/${currentUser._id}/${_id}`);
    return res.data;
    }
    catch(error){
      console.log(error)
    }
  }
  
  const getJobPoster = async () => {

    const jobPosterId = await axios.get(`${getJobPosterById}/${_id}`);
    // console.log(currentUser,jobPosterId.data)
    setJobPoster(jobPosterId.data);
    
  };
  useEffect(() => {
    const fetchStatusOfJob = async () => {
      try {
        if (currentUser._id) {
          getJobPoster();
         // console.log(currentUser._id);
          const datak = await getStatusOfJob();
          //await console.log(data);
          await (datak.appliedJobId) ? 
             (setIsApplied(true))
             (setApplicationStatus(datak.applicationStatus) ) :  
             (setIsApplied(false)) (setApplicationStatus(datak.applicationStatus)) 
          //await console.log(isApplied);
          //await console.log(ApplicationStatus);
        }
      } 
      catch (error) {
        console.error('Error fetching status of job application:', error);
      }
    };
  
    fetchStatusOfJob();
  }, [currentUser._id, ApplicationStatus, isApplied]); // Dependency array includes currentUser._id and isApplied
  


  const showFileInputModal = async() => {
    Swal.fire({
      title: 'Select PDF File',
      html: `
        <input type="file" id="file-input" accept="application/pdf">
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) {
          Swal.showValidationMessage('You need to select a file');
        }
        return file;
      }
    
    }).then((result) => {
      if (result.isConfirmed) {
        const file = result.value;
        handleUpload(file);
      }
    }).catch((error) => {
      console.error(error);
    });
  };
  
const getSignatureForUpload = async (folder) => {
  try{
    const res = await axios.post(getSignature,{folder});
    return res.data;
  }catch(error){
    console.log(error);
  }
}

const uploadFile = async (type,timestamp,signature,file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("timestamp",timestamp);
  data.append("signature",signature);
  data.append("api_key",process.env.REACT_APP_CLOUDINARY_API_KEY);

  try{
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const resourceType = type;
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

    const res = await axios.post(api,data);
    const { secure_url } = res.data;
    return secure_url;
  }catch(error){
    console.log(error);
  }
}

async function handleUpload(file) {
    let fileUrl;
        try {
            setIsDisable(true);
            const { timestamp:imgTimestamp, signature : imgSignature} = await getSignatureForUpload('images');
            await axios.post(`${jobemail}/${data._id}`,{current:currentUser.username});
            const filesUrl = await uploadFile(file.type.split("/")[0],imgTimestamp,imgSignature,file);
            fileUrl=filesUrl;
            await axios.post(`${addApplicantDetails}/${_id}`,{
              userId : currentUser._id,
              fileUrl : filesUrl
            });
            await axios.post(`${addAppliedJob}/${currentUser._id}`,{
              appliedJobId : _id
            })
            const datak = await getStatusOfJob();   
           
             setIsApplied(true);
             setIsDisable(false);
             setApplicationStatus(datak.applicationStatus);
        } catch (error) {
          console.error('Error uploading multiple files:', error);
          throw error;
        }
        console.log(fileUrl)
}
  
  const handleClick = async() => {
    //console.log(currentUser.username);
    await showFileInputModal();
  }
  
  const dateObject = new Date(jobPostingDate);
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1; // Months are zero-indexed, so we add 1
  const day = dateObject.getDate();

  // Format the date as DD-MM-YYYY
  const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

  return (
    <section >
      <div className='CardSection'>
        <img src={companyLogo} alt='' />
        <div className='ficard'>
          <h4 className='CardCompanyName'>{companyName}</h4>
          <h3 className='CardJobTitle'>{jobTitle}</h3>
          <div className='CardPropsDiv'>
            <span className='CardProp'><FiMapPin />{jobLocation}</span>
            <span className='CardProp'><FiClock />{employmentType}</span>
            <span className='CardProp'><FiDollarSign />{minPrice}-{maxPrice}k</span>
            <span className='CardProp'><FiCalendar />{formattedDate}</span> 
          </div>
          <p className='CardDescription'>{jobDescription}</p>
          <div className='ButtonContainer'>
          {(jobPoster !== currentUser._id) ?
            (isApplied === false ?
              <button disabled={isDisable} className='applyButton' onClick={handleClick}>
                {!isDisable ? 'Apply' :
                <img 
                  src={Loading} 
                  alt="loading" 
                  className="loading"
                  style={{
                    width: "30px", // Adjust size as needed
                    height: "30px", // Adjust size as needed
                  }}
                />}
              </button> :
              <button disabled className='appliedButton'   
              style={{
                backgroundColor: ApplicationStatus === 'Accepted' ? 'green' : (ApplicationStatus === 'Rejected' ? 'red' : 'rgb(72, 72, 242)')
              }}  >     {ApplicationStatus}  
                  </button>
            )
            : <button  className='viewBtn' onClick={()=>navigate(`/applicantDetails/${_id}`)}>View Applications</button>

          }
        </div>
        
        </div>
      </div>
    </section>
  );
};


export default Card;
