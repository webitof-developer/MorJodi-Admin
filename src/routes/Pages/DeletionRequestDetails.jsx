import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from "../../components/Config";

const DeletionRequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchRequestDetails();
  
  }, [id]);

  // ---------------------------
  // Fetch details
  // ---------------------------
  const fetchRequestDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/deletion-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
console.log(response.data)
      setRequest(response.data.request);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };


  // ---------------------------
  // Approve request
  // ---------------------------
  const handleApproveRequest = async () => {
    Swal.fire({
      title: "Approve Account Deletion?",
      text: "User account will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16A34A",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `${API_BASE_URL}/api/user/deletion-requests/${id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setRequest({ ...request, status: "approved" });

          Swal.fire("Approved!", "The deletion request has been accepted.", "success");
        } catch (err) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!request) return <div>Request not found.</div>;

  return (
    <div className="p-4">
    

      <div className="card">
        <h1 className="text-lg font-semibold dark:text-white">Deletion Request Details</h1>

     <div className="mb-4">
  <strong className="text-gray-900 dark:text-white">User:</strong>
  <p className="text-gray-900 dark:text-white">
    {request.user.fullName} ({request.user.email})
  </p>
</div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Reason:</strong>
          <p className="text-gray-900 dark:text-white">{request.reason}</p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Status:</strong>
          <p className="capitalize text-gray-900 dark:text-white">{request.status}</p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-900 dark:text-white">Created At:</strong>
          <p className="text-gray-900 dark:text-white">{new Date(request.createdAt).toLocaleString()}</p>
        </div>

        {request.status === "pending" && (
          <button
            onClick={handleApproveRequest}
            className=" w-40 px-4 py-2 bg-primary text-white rounded hover:bg-primary mr-3"
          >
            Approve Request
          </button>
        )}
      </div>
    </div>
  );
};

export default DeletionRequestDetails;
