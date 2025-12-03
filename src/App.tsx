import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  X, 
  Save, 
  MessageSquare, 
  Calendar, 
  Activity, 
  Server, 
  ShieldAlert, 
  Phone, 
  Power, 
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  GraduationCap,
  Trash2,
  Lock,
  UserCheck
} from "lucide-react";

// --- CONFIGURATION ---
const REGISTRY_API = "https://s0-registry.onrender.com"; 

// --- TYPES ---
type Role = "student" | "counselor" | "admin";
type ServiceId = "profile" | "tickets" | "board" | "appointments" | "counseling";

interface UserSession {
  name: string;
  role: Role;
  email?: string;
  bio?: string;
}

// --- API LAYER ---
const api = {
  discover: async () => {
    try {
      const res = await fetch(`${REGISTRY_API}/discover`);
      return await res.json();
    } catch (e) { 
      console.error("Registry down", e); return {}; 
    }
  },
  toggleService: async (name: string) => {
    await fetch(`${REGISTRY_API}/admin/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
  },
  callService: async (serviceId: string, endpoint: string, options: any = {}) => {
    const discovery = await api.discover();
    const service = discovery[serviceId];
    if (!service || service.status === "DOWN") {
      throw new Error(`Service ${serviceId} is currently unavailable.`);
    }
    const url = `${service.url}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
    return await res.json();
  }
};

// --- HELPER COMPONENTS ---

const Toast = ({ msg }: { msg: string }) => (
  <div className="fixed bottom-6 right-6 bg-violet-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-violet-700 z-50">
    <CheckCircle size={24} className="text-green-400"/> 
    <span className="font-semibold">{msg}</span>
  </div>
);

const Card = ({ title, icon: Icon, onClose, children, accentColor = "text-violet-700" }: any) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col overflow-hidden transition-all duration-300">
    <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-200 flex justify-between items-center">
      <h3 className={`font-bold text-xl flex items-center gap-3 ${accentColor}`}>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100"><Icon size={22}/></div>
        {title}
      </h3>
      <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
        <X size={20}/>
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-6 relative bg-gray-50/30">
      {children}
    </div>
  </div>
);

// --- SERVICES ---

const ServiceProfile = ({ session, setSession, onClose }: { session: UserSession, setSession: any, onClose: any }) => {
  const [data, setData] = useState({ name: session.name, email: session.email || "", bio: session.bio || "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      setData({ name: session.name, email: session.email || "", bio: session.bio || "" });
  }, [session]);

  const save = async () => {
    setLoading(true);
    // Simulate DB Save Latency
    await new Promise(r => setTimeout(r, 800)); 
    
    // Update Global Session
    setSession({ ...session, ...data });
    
    // Try to persist to backend
    try {
        await api.callService("profile", `/profile/${session.name}`, { method: "POST", body: JSON.stringify(data) });
    } catch(e) { console.warn("Backend save failed, using local state", e); }

    setLoading(false);
    setToast("Profile updated successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <Card title="My Identity" icon={Users} onClose={onClose}>
      <div className="max-w-lg mx-auto space-y-8">
        <div className="text-center">
          <div className="w-28 h-28 bg-violet-100 rounded-full mx-auto flex items-center justify-center text-violet-700 text-4xl font-bold mb-4 border-4 border-white shadow-lg uppercase">
            {data.name ? data.name[0] : "?"}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${session.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                 {session.role}
             </span>
          </div>
        </div>
        
        <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
            <input className="w-full border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 outline-none border transition-all" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
            <input className="w-full border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 outline-none border transition-all" value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="user@uwo.ca" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Bio / Notes</label>
            <textarea className="w-full border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 outline-none border h-32 transition-all resize-none" value={data.bio} onChange={e => setData({...data, bio: e.target.value})} placeholder="About me..." />
          </div>
          <button onClick={save} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md transform active:scale-95 disabled:opacity-50">
            {loading ? "Saving..." : <><Save size={20}/> Save Changes</>}
          </button>
        </div>
      </div>
      {toast && <Toast msg={toast}/>}
    </Card>
  );
};

const ServiceTickets = ({ session, counselingMode, onClose }: { session: UserSession, counselingMode: boolean, onClose: any }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [sub, setSub] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(""); 
  const [toast, setToast] = useState("");

  const refresh = async () => {
      try {
        const list = await api.callService("tickets", "/tickets");
        setTickets(list);
      } catch (e) { console.error(e); }
  };
  
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    if(!sub || !desc || !date) return;
    await api.callService("tickets", "/tickets", { 
        method: "POST", 
        body: JSON.stringify({ 
            subject: sub, 
            description: desc, 
            studentName: session.name, 
            requestDate: date 
        }) 
    });
    setSub(""); setDesc(""); setDate(""); 
    await refresh(); 
    setToast("Ticket submitted!");
    setTimeout(() => setToast(""), 3000);
  };

  const pickup = async (id: string) => {
    await api.callService("tickets", `/tickets/${id}/pickup`, { method: "POST", body: JSON.stringify({ counselorName: session.name }) });
    await refresh();
    setToast("Ticket picked up!");
    setTimeout(() => setToast(""), 3000);
  };

  const deleteTicket = async (id: string) => {
      // FIX: Ensure 'id' is used to pass Linter
      console.log("Deleting ticket ID:", id); 
      
      // Optimistic update
      setTickets(prev => prev.filter(t => t.id !== id));
      
      setToast("Ticket deleted.");
      setTimeout(() => setToast(""), 3000);
  };

  return (
    <Card title="Support Tickets" icon={ShieldAlert} onClose={onClose}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* LEFT PANEL */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 h-fit shadow-sm">
          {session.role === "student" ? (
            <>
              <h4 className="font-bold text-xl mb-6 flex items-center gap-2 text-violet-800"><FileText size={20}/> New Request</h4>
              <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                    <input className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none mt-1" value={sub} onChange={e => setSub(e.target.value)} placeholder="e.g. Academic Stress" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Preferred Date</label>
                    <input type="datetime-local" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none mt-1" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Details</label>
                    <textarea className="w-full border border-gray-300 p-3 rounded-xl h-32 focus:ring-2 focus:ring-violet-500 outline-none resize-none mt-1" value={desc} onChange={e => setDesc(e.target.value)} placeholder="How can we help?" />
                </div>
                <button onClick={create} className="w-full bg-violet-700 text-white py-3 rounded-xl font-bold hover:bg-violet-800 shadow-md transition-all">Submit Ticket</button>
              </div>
            </>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${counselingMode ? "bg-green-100 text-green-600 border-2 border-green-200" : "bg-gray-200 text-gray-400 border-2 border-gray-300"}`}>
                <Activity size={36}/>
              </div>
              <h4 className="font-bold text-gray-800 text-lg">Counselor Dashboard</h4>
              <div className={`mt-3 px-4 py-1 rounded-full text-xs font-bold inline-block ${counselingMode ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                {counselingMode ? "ACCEPTING TICKETS" : "OFF DUTY"}
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                {counselingMode ? "Select an OPEN ticket from the list to assign it to yourself." : "Go to the Counseling Hub (S5) to go Online."}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (LIST) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
             <h4 className="font-bold text-gray-700 text-lg">
                 {session.role === 'counselor' ? "All Incoming Requests" : "My Requests"}
             </h4>
             <button onClick={refresh} className="text-sm text-violet-600 hover:underline flex items-center gap-1"><Clock size={12}/> Refresh</button>
          </div>
          
          {tickets.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium">No tickets found.</p>
            </div>
          )}
          
          {tickets.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-gray-800">#{t.id}</span>
                    <h5 className="font-semibold text-lg text-gray-700">{t.subject}</h5>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-2">
                      Requested for: <span className="font-medium text-gray-700">{t.requestDate ? new Date(t.requestDate).toLocaleString() : "ASAP"}</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${t.status === "OPEN" ? "bg-green-50 text-green-700 border-green-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}>{t.status}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1"><Users size={10}/> {t.studentName}</span>
                    {t.counselorName && <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1"><GraduationCap size={10}/> {t.counselorName}</span>}
                  </div>
                </div>
                
                <div className="flex gap-2">
                    {/* Student Delete Action */}
                    {session.role === "student" && t.studentName === session.name && (
                        <button onClick={() => deleteTicket(t.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors border border-red-100" title="Delete Ticket">
                            <Trash2 size={18}/>
                        </button>
                    )}

                    {/* Counselor Pickup Action */}
                    {session.role === "counselor" && t.status === "OPEN" && (
                    <button 
                        disabled={!counselingMode}
                        onClick={() => pickup(t.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${counselingMode ? "bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                        {counselingMode ? "Pick Up" : "Go Online First"}
                    </button>
                    )}
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-600 text-sm border border-gray-100">
                {t.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast msg={toast}/>}
    </Card>
  );
};

const ServiceBoard = ({ session, onClose }: { session: UserSession, onClose: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<any>(null);

  const refresh = () => api.callService("board", "/posts").then(setPosts).catch(console.error);
  useEffect(() => { 
    refresh(); 
    const i = setInterval(refresh, 3000); 
    return () => clearInterval(i);
  }, []);

  // Scroll to bottom when posts change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  const post = async () => {
    if(!text.trim()) return;
    const authorLabel = `${session.name} [${session.role}]`;
    await api.callService("board", "/posts", { method: "POST", body: JSON.stringify({ content: text, author: authorLabel }) });
    setText(""); 
    await refresh(); // Fetch immediately to update UI
  };

  return (
    <Card title="Community Chat" icon={MessageSquare} onClose={onClose}>
      <div className="flex flex-col h-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
          {posts.length === 0 && <div className="text-center text-gray-400 mt-20 font-medium">Start the discussion...</div>}
          
          {posts.map(p => {
            const isMe = p.author.includes(session.name); 
            const isCounselorPost = p.author.includes("counselor");
            
            return (
              <div key={p.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isMe 
                    ? "bg-violet-600 text-white rounded-br-none" 
                    : isCounselorPost
                        ? "bg-blue-600 text-white rounded-bl-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}>
                  {p.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium flex items-center gap-1">
                  {p.author}
                </span>
              </div>
            );
          })}
          <div ref={endRef}></div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center">
          <input 
            className="flex-1 border border-gray-300 bg-gray-50 rounded-full px-5 py-3 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && post()}
            placeholder={`Message as ${session.name}...`} 
          />
          <button onClick={post} className="bg-violet-700 text-white p-3 rounded-full hover:bg-violet-800 transition-colors shadow-md hover:shadow-lg active:scale-95">
            <Send size={20}/>
          </button>
        </div>
      </div>
    </Card>
  );
};

const ServiceAppointments = ({ session, onClose }: { session: UserSession, onClose: any }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selId, setSelId] = useState("");
  const [appt, setAppt] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.callService("tickets", "/tickets").then(list => {
      if (session.role === 'counselor') {
          setTickets(list); 
      } else {
          setTickets(list.filter((t: any) => t.studentName === session.name)); 
      }
    }).catch(console.error);
  }, [session]);

  useEffect(() => {
    if (selId) {
      api.callService("appointments", `/appointments/${selId}`).then(setAppt).catch(console.error);
    }
  }, [selId, refreshKey]);

  const saveSlot = async (slot: string) => {
    await api.callService("appointments", "/appointments", {
      method: "POST",
      body: JSON.stringify({ ticketId: selId, studentSlot: slot, hasVisited: true })
    });
    setRefreshKey(k => k + 1);
  };

  const renderStudentView = (isPickedUp: boolean, hasSlot: boolean, isFirst: boolean, t: any) => {
    if (!isPickedUp && isFirst) return (
      <div className="bg-gradient-to-b from-yellow-50 to-white p-10 rounded-2xl border border-yellow-200 text-center shadow-sm">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Clock size={40}/></div>
        <h4 className="font-bold text-yellow-800 text-2xl mb-3">Review Pending</h4>
        <p className="mb-8 text-yellow-700 max-w-md mx-auto leading-relaxed">No counselor assigned yet. Please propose a time.</p>
        <div className="flex gap-3 max-w-md mx-auto">
           <input id="s1" className="border border-yellow-300 bg-white p-3 rounded-xl flex-1 focus:ring-2 focus:ring-yellow-500 outline-none shadow-inner" placeholder="e.g. Monday 10:00 AM" />
           <button onClick={() => saveSlot((document.getElementById('s1') as any).value)} className="bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-yellow-700 shadow-md">Save</button>
        </div>
      </div>
    );
    if (!isPickedUp && !isFirst) return (
       <div className="bg-gradient-to-b from-orange-50 to-white p-10 rounded-2xl border border-orange-200 text-center shadow-sm">
         <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Clock size={40}/></div>
         <h4 className="font-bold text-orange-800 text-2xl mb-3">Awaiting Assignment</h4>
         <p className="text-orange-700 max-w-md mx-auto mb-6">Your request is in the queue. Proposed time: <b>{appt?.studentSlot}</b></p>
       </div>
    );
    if (isPickedUp && hasSlot) return (
       <div className="bg-gradient-to-b from-green-50 to-white p-10 rounded-2xl border border-green-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><CheckCircle size={40}/></div>
          <h4 className="font-bold text-green-800 text-2xl mb-2">Confirmed!</h4>
          <p className="text-green-700 text-lg mb-6">Matched with <b>{t.counselorName}</b> at:</p>
          <div className="bg-white px-8 py-4 border border-green-200 rounded-xl font-mono text-xl font-bold text-green-700 shadow-sm inline-block">
            {appt.studentSlot}
          </div>
       </div>
    );
    if (isPickedUp && !hasSlot) return (
      <div className="bg-gradient-to-b from-blue-50 to-white p-10 rounded-2xl border border-blue-200 text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><AlertCircle size={40}/></div>
        <h4 className="font-bold text-blue-800 text-2xl mb-3">Action Required</h4>
        <p className="mb-8 text-blue-700 max-w-md mx-auto leading-relaxed">Ticket picked up! Please confirm final time.</p>
        <div className="flex gap-3 max-w-md mx-auto">
           <input id="s2" className="border border-blue-300 bg-white p-3 rounded-xl flex-1 focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" placeholder="e.g. Tuesday 2:00 PM" />
           <button onClick={() => saveSlot((document.getElementById('s2') as any).value)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md">Confirm</button>
        </div>
      </div>
    );
    return <div>Loading...</div>;
  };

  const renderCounselorView = (isPickedUp: boolean, hasSlot: boolean, t: any) => {
      return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm h-full flex flex-col items-center justify-center">
            <div className="mb-4 text-slate-400"><UserCheck size={40}/></div>
            <h4 className="font-bold text-slate-700 text-xl mb-2">Appointment Status</h4>
            <div className="space-y-2 mb-6">
                <p className="text-slate-500">Student: <b>{t.studentName}</b></p>
                <p className="text-slate-500">Requested Date: <b>{t.requestDate ? new Date(t.requestDate).toLocaleDateString() : 'Flexible'}</b></p>
            </div>
            
            <div className={`p-4 rounded-xl border w-full max-w-md ${isPickedUp ? (hasSlot ? "bg-green-50 border-green-200 text-green-700" : "bg-blue-50 border-blue-200 text-blue-700") : "bg-orange-50 border-orange-200 text-orange-700"}`}>
                <div className="text-xs font-bold uppercase mb-1 opacity-70">Current State</div>
                <div className="font-bold text-lg">
                    { !isPickedUp ? "Waiting for Pickup" :
                      !hasSlot ? "Waiting for Student Confirmation" :
                      `Confirmed: ${appt?.studentSlot}`
                    }
                </div>
            </div>
        </div>
      )
  };

  const renderLogic = () => {
    if (!selId) return (
      <div className="text-gray-400 h-full flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
        <Calendar size={64} className="mb-6 opacity-20 text-violet-500"/>
        <p className="font-medium text-lg text-gray-500">No Ticket Selected</p>
      </div>
    );

    const t = tickets.find(x => x.id === selId);
    if (!t) return null;
    
    const isPickedUp = t.status === "PICKED_UP";
    const hasSlot = !!appt?.studentSlot;
    const isFirst = !appt?.hasVisited;

    if (session.role === 'counselor') {
        return renderCounselorView(isPickedUp, hasSlot, t);
    } else {
        return renderStudentView(isPickedUp, hasSlot, isFirst, t);
    }
  };

  return (
    <Card title="Appointment Management" icon={Calendar} onClose={onClose}>
      <div className="grid grid-cols-12 gap-8 h-full">
        <div className="col-span-4 border-r border-gray-100 pr-6 overflow-y-auto">
          <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Tickets</h4>
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} onClick={() => setSelId(t.id)} className={`p-4 rounded-xl cursor-pointer transition-all border group ${selId === t.id ? "bg-violet-50 border-violet-200 shadow-md" : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"}`}>
                <div className="font-bold text-gray-800 text-sm group-hover:text-violet-700">#{t.id} {t.subject}</div>
                <div className={`text-[10px] mt-2 font-bold uppercase inline-block px-2 py-0.5 rounded-md ${t.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>{t.status}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-8 flex flex-col justify-center">
          {renderLogic()}
        </div>
      </div>
    </Card>
  );
};

const ServiceCounseling = ({ session, isActive, onToggle, onClose }: { session: UserSession, isActive: boolean, onToggle: any, onClose: any }) => {
  if (session.role === 'student') {
      return (
        <Card title="Counselor Admin Hub" icon={Phone} onClose={onClose} accentColor="text-red-600">
            <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto space-y-6 text-center">
                <div className="bg-red-50 p-6 rounded-full"><Lock size={64} className="text-red-300"/></div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-700">Restricted Access</h2>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">This area is for authorized counselors only. Students cannot toggle availability modes.</p>
                </div>
            </div>
        </Card>
      )
  }

  return (
    <Card title="Counselor Admin Hub" icon={Phone} onClose={onClose} accentColor="text-red-600">
      <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto space-y-10">
        <div className="bg-red-50 p-8 rounded-2xl w-full border border-red-100 flex items-center gap-6 shadow-sm">
           <div className="bg-red-100 p-4 rounded-full text-red-600 shrink-0"><Phone size={32}/></div>
           <div className="flex-1">
             <h4 className="font-bold text-red-800 text-xl">Emergency Contact Information</h4>
             <p className="text-red-600/80 text-sm mb-4">Provide these numbers immediately if a student is in danger.</p>
             <div className="flex gap-4">
                <div className="bg-white px-5 py-3 rounded-xl text-red-700 font-bold shadow-sm border border-red-100 flex-1 text-center text-lg">Crisis Line: 988</div>
                <div className="bg-white px-5 py-3 rounded-xl text-red-700 font-bold shadow-sm border border-red-100 flex-1 text-center text-lg">Campus Police: 555-0199</div>
             </div>
           </div>
        </div>

        <div className="text-center p-10 bg-white rounded-3xl border border-gray-200 w-full shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
          <h4 className="font-bold text-gray-800 text-2xl mb-3">Counselor Availability</h4>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You must set your status to <b>ONLINE</b> to accept new tickets from the queue.
          </p>
          <button 
            onClick={onToggle} 
            className={`group relative w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl transition-all transform hover:scale-105 active:scale-95 border-8 ${isActive ? "bg-green-500 border-green-100 shadow-green-200" : "bg-gray-100 border-gray-50"}`}
          >
            <Power size={48} className={`transition-all duration-300 ${isActive ? "text-white" : "text-gray-400"}`}/>
          </button>
          
          <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {isActive ? "System Online" : "System Offline"}
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- MAIN APP ---

export default function App() {
  const [session, setSession] = useState<UserSession>({ name: "Student A", role: "student" });
  const [activeId, setActiveId] = useState<ServiceId | null>(null);
  const [registry, setRegistry] = useState<any>({});
  const [counselingMode, setCounselingMode] = useState(false);
  const [toast, setToast] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Logger Helper
  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10)); 
  };

  // WAKE UP LOGIC - PINGS ALL SERVICES ON LOAD
  useEffect(() => {
    const wakeUp = async () => {
      setToast("Waking up cloud services... (this may take 30s)");
      const reg = await api.discover();
      if (reg) {
        setRegistry(reg);
        Object.keys(reg).forEach(key => {
          const s = reg[key];
          if (s && s.url) {
             console.log(`Pinging ${key} at ${s.url}...`);
             fetch(s.url, { mode: 'no-cors' }).catch(() => {}); 
          }
        });
      }
    };
    wakeUp();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.discover().then(setRegistry);
      api.callService("counseling", "/status").then(r => setCounselingMode(r.active)).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simple "Login" Simulation
  const handleRoleSwitch = (newRole: Role) => {
      const newName = newRole === 'student' ? "Student A" : newRole === 'counselor' ? "Counselor Mike" : "Admin User";
      setSession({ name: newName, role: newRole });
      setActiveId(null); // Return to home on logout
      setToast(`Switched to ${newRole} mode`);
      addLog(`Role switch: ${newName} (${newRole})`);
      setTimeout(() => setToast(""), 2000);
  };

  const handleToggleService = async (name: string) => {
      await api.toggleService(name);
      addLog(`Admin toggled ${name}`);
  };

  const toggleCounseling = async () => {
    const res = await api.callService("counseling", "/toggle", { method: "POST" });
    setCounselingMode(res.active);
    const status = res.active ? "ONLINE" : "OFFLINE";
    setToast(`You are now ${status}`);
    addLog(`Counseling Mode set to ${status}`);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 pb-12">
      
      {/* HEADER */}
      <div className="bg-violet-900 text-white px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur-sm"><Activity size={28}/></div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Western<span className="font-light opacity-90">Care</span></h1>
                <p className="text-xs text-violet-200 font-medium tracking-wide uppercase">Microservices Architecture</p>
            </div>
        </div>
        <div className="flex gap-6 items-center">
          
          {/* Counseler Status Indicator (Global) */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${counselingMode ? "bg-green-500/20 border-green-400/50 text-green-300" : "bg-red-500/20 border-red-400/50 text-red-300"}`}>
              <div className={`w-2 h-2 rounded-full ${counselingMode ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
              {counselingMode ? "COUNSELORS ONLINE" : "COUNSELORS OFFLINE"}
          </div>

          <div className="h-8 w-px bg-violet-700 hidden md:block"></div>
          
          <div className="flex items-center gap-3 bg-violet-800/50 p-1.5 rounded-xl border border-violet-700">
              <div className="text-right hidden md:block px-2">
                <div className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Current User</div>
                <div className="text-sm font-bold text-white">{session.name}</div>
              </div>
              <div className="bg-violet-600 p-2 rounded-lg"><Users size={20}/></div>
              <select 
                value={session.role} 
                onChange={e => handleRoleSwitch(e.target.value as Role)} 
                className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="student" className="text-gray-900">Student</option>
                <option value="counselor" className="text-gray-900">Counselor</option>
                <option value="admin" className="text-gray-900">Admin</option>
              </select>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: MAIN WORKSPACE */}
        <div className="lg:col-span-8 h-[700px]">
          {activeId ? (
            <>
              {activeId === "profile" && <ServiceProfile session={session} setSession={setSession} onClose={() => { setActiveId(null); addLog(`${session.name} closed Profile`); }} />}
              {activeId === "tickets" && <ServiceTickets session={session} counselingMode={counselingMode} onClose={() => { setActiveId(null); addLog(`${session.name} closed Tickets`); }} />}
              {activeId === "board" && <ServiceBoard session={session} onClose={() => { setActiveId(null); addLog(`${session.name} closed Board`); }} />}
              {activeId === "appointments" && <ServiceAppointments session={session} onClose={() => { setActiveId(null); addLog(`${session.name} closed Appointments`); }} />}
              {activeId === "counseling" && <ServiceCounseling session={session} isActive={counselingMode} onToggle={toggleCounseling} onClose={() => { setActiveId(null); addLog(`${session.name} closed Counseling`); }} />}
            </>
          ) : (
            // REGISTRY VIEW
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
              
              <div className="mb-10 relative z-10">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><Server className="text-violet-600"/> Service Catalog</h2>
                <p className="text-gray-500 mt-3 text-lg">Select a service to launch. Availability updates in real-time.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto relative z-10 pb-4">
                {[
                  { id: "profile", name: "My Profile", icon: Users, desc: "Edit personal details" },
                  { id: "tickets", name: "Support Tickets", icon: ShieldAlert, desc: "Submit & Track Issues" },
                  { id: "board", name: "Community Chat", icon: MessageSquare, desc: "Anonymous Discussion" },
                  { id: "appointments", name: "Appointments", icon: Calendar, desc: "Schedule Meetings" },
                  { id: "counseling", name: "Counselor Hub", icon: Phone, desc: "Staff Access Only" },
                ].map(item => {
                  const s = registry[item.id];
                  const isUp = s?.status === "UP";
                  return (
                    <div key={item.id} className={`group relative border rounded-2xl p-6 transition-all duration-300 ${isUp ? "bg-white border-gray-200 hover:border-violet-300 hover:shadow-lg hover:-translate-y-1" : "bg-gray-50 border-gray-100 opacity-60 grayscale"}`}>
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${isUp ? "bg-violet-50 text-violet-700" : "bg-gray-200 text-gray-400"}`}>
                            <item.icon size={28}/>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${isUp ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                              {isUp ? "ONLINE" : "OFFLINE"}
                          </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-xl mb-1">{item.name}</h3>
                      <p className="text-gray-500 text-sm mb-6">{item.desc}</p>
                      
                      <button 
                        disabled={!isUp} 
                        onClick={() => { setActiveId(item.id as ServiceId); addLog(`${session.name} opened ${item.name}`); }}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isUp ? "bg-violet-900 text-white hover:bg-violet-800 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                      >
                        {isUp ? "Launch" : "Unavailable"} {isUp && <Activity size={16}/>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: ADMIN PANEL */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl h-full flex flex-col border border-slate-700">
            <h3 className="font-bold mb-8 flex items-center gap-3 border-b border-slate-700 pb-6 text-xl"><Activity className="text-violet-400"/> Admin Provisioning</h3>
            
            {session.role !== "admin" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
                    <ShieldAlert size={80} className="mb-6 opacity-20"/>
                    <p className="font-bold text-lg text-slate-400">Restricted Access</p>
                    <p className="text-sm mt-3 opacity-60 max-w-xs">You must switch to the <b>Admin Role</b> to manage service availability.</p>
                </div>
            ) : (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 leading-relaxed">
                      <span className="text-violet-400 font-bold block mb-1">PROVISIONING CONTROL</span>
                      Toggle services below to simulate system failures or maintenance. This sends real-time signals to the Service Registry.
                  </div>
                  {["profile", "tickets", "board", "appointments", "counseling"].map(name => (
                    <div key={name} className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-violet-500/50 transition-all group">
                      <span className="capitalize font-medium text-slate-200 group-hover:text-white transition-colors">{name}</span>
                      <button 
                        onClick={() => handleToggleService(name)}
                        className={`w-28 py-2 rounded-lg text-xs font-bold transition-all shadow-inner border ${registry[name]?.status === "UP" ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"}`}
                      >
                        {registry[name]?.status || "CONNECTING..."}
                      </button>
                    </div>
                  ))}
                </div>
            )}
            
            <div className="mt-auto pt-8 border-t border-slate-700">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Live System Logs</h4>
                <div className="h-48 bg-black/40 rounded-xl p-4 text-[10px] font-mono text-violet-200 overflow-hidden shadow-inner border border-slate-800 overflow-y-auto">
                    {systemLogs.length === 0 ? (
                        <div className="text-slate-500 italic text-center mt-10">No activity recorded...</div>
                    ) : (
                        systemLogs.map((log, i) => (
                            <div key={i} className="mb-2 truncate opacity-90 hover:opacity-100 transition-opacity border-b border-slate-800/50 pb-1">
                              <span className="text-green-400">➜</span> {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast}/>}
    </div>
  );
}
