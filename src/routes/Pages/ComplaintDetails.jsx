import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../../components/Config";
import { FilePenLine } from "lucide-react";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetails();
  
  }, [id]);

  // -----------------------------
  // FETCH DETAILS
  // -----------------------------
  const fetchComplaintDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaint(response.data.complaint);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found.</div>;

  return (
    <div className="card">
     
    

        {/* EDIT BUTTON (NAVIGATE TO EDIT PAGE) */}
   
      

      <div className="">
        <h1 className="text-lg font-bold mb-4 dark:text-white">Complaint Details</h1>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Subject:</strong>
          <p className="text-gray-900 dark:text-white">{complaint.subject}</p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Message:</strong>
          <p className="text-gray-900 dark:text-white">{complaint.message}</p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Complaint Type:</strong>
          <p className="text-gray-900 dark:text-white">{complaint.complaintType}</p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Status:</strong>
          <p className="capitalize text-gray-900 dark:text-white">{complaint.status}</p>
        </div>

        <div className="mb-4 ">
          <strong className="capitalize text-gray-900 dark:text-white">Admin Response:</strong>
          <p className="capitalize text-gray-900 dark:text-white">{complaint.adminResponse || "No response yet"}</p>
        </div>
             <Link
          to={`/edit-complaint/${id}`}
        
        >
          <FilePenLine size={18}   className="text-primary cursor-pointer" />
         
        </Link>
      </div>
    </div>
  );
};

export default ComplaintDetails;


