import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../../components/Config";
import { FilePenLine, Send, User, Shield, CheckCircle } from "lucide-react";
import Swal from "/src/utils/swalTheme";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const scrollRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat when timeline changes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [complaint?.timeline]);

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

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      setSendingReply(true);

      // Use the new reply endpoint
      const res = await axios.post(
        `${API_BASE_URL}/api/complaints/${id}/reply`,
        { message: replyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaint(res.data.complaint);
      setReplyMessage("");
      setSendingReply(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      setSendingReply(false);
      Swal.fire("Error", "Failed to send reply", "error");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/complaints/status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(res.data.complaint);
      Swal.fire("Updated", `Status changed to ${newStatus}`, "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found.</div>;

  // Merge legacy adminResponse if visible and not in timeline?
  // Current logic: Just show timeline. If legacy adminResponse exists, maybe show it as a sticky note or pre-pended message.
  // For now, let's assume valid timeline or fallback.

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* LEFT SIDE: INFO */}
      <div className="w-full md:w-1/3 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-xl shadow-sm overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold dark:text-white mb-2">Ticket Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${complaint.status === 'open' ? 'bg-orange-100 text-orange-800' :
              complaint.status === 'solved' ? 'bg-green-100 text-green-800' :
                complaint.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
            }`}>
            {complaint.status}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
            <p className="text-gray-900 dark:text-white font-medium text-lg">{complaint.subject}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">User</label>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold">{complaint.userId?.fullName?.[0] || 'U'}</span>
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-white">{complaint.userId?.fullName}</p>
                <p className="text-xs text-gray-500">{complaint.userId?.email}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              {complaint.message}
            </div>
          </div>

          {complaint.imageUrl && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Attachment</label>
              <img
                src={`${API_BASE_URL}/${complaint.imageUrl.replace(/\\/g, '/')}`}
                alt="Attachment"
                className="mt-2 w-full h-48 object-cover rounded-lg border dark:border-gray-600"
              />
            </div>
          )}

          <div className="pt-6 border-t dark:border-gray-700">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quick Actions</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('in progress')}
                className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate('solved')}
                className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Mark Solved
              </button>
            </div>
            <button
              onClick={() => handleStatusUpdate('closed')}
              className="w-full mt-2 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Close Ticket
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: CHAT */}
      <div className="w-full md:w-2/3 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold dark:text-white">Conversation History</h3>
          <span className="text-xs text-gray-500">{complaint.timeline?.length || 0} messages</span>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-900"
        >
          {/* Show Initial Message as First Item in Chat? Or rely on description? 
                     Let's show it if timeline is empty, or show timeline. 
                     The Controller adds the initial message to timeline, so we just map timeline. */}

          {complaint.timeline && complaint.timeline.map((msg, idx) => {
            // Check role: 'admin' or 'user'
            const isAdmin = msg.role === 'admin';
            return (
              <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {isAdmin ? <Shield size={14} /> : <User size={14} />}
                  </div>

                  <div className={`px-4 py-2 rounded-2xl text-sm ${isAdmin
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-[#f8f9fa] shadow-sm text-gray-800 border shadow-sm rounded-bl-none dark:bg-gray-700 dark:text-white dark:border-gray-600'
                    }`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {(!complaint.timeline || complaint.timeline.length === 0) && (
            <div className="text-center text-gray-500 mt-10">
              <p>No conversation history yet.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="relative">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows="2"
            />
            <button
              onClick={handleSendReply}
              disabled={sendingReply || !replyMessage.trim()}
              className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingReply ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
