import { useState, useEffect } from "react";
import { Users, Save, MessageSquare, Calendar, Activity, Server, ShieldAlert, Phone, Power } from "lucide-react";

// --- CONFIGURATION ---
const REGISTRY_API = "https://s0-registry.onrender.com";

// --- TYPES ---
type Role = "student" | "counselor" | "admin";
type ServiceId = "profile" | "tickets" | "board" | "appointments" | "counseling";

const api = {
  // Discover services from Registry
  discover: async () => {
    try {
      const res = await fetch(`${REGISTRY_API}/discover`);
      return await res.json();
    } catch (e) { 
      console.error("Registry down"); return {}; 
    }
  },
  
  // Admin Toggle
  toggleService: async (name: string) => {
    await fetch(`${REGISTRY_API}/admin/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
  },

  // Call Service
  callService: async (serviceId: string, endpoint: string, options: any = {}) => {
    const discovery = await api.discover();
    const service = discovery[serviceId];
    
    // Dynamic Check
    if (!service || service.status === "DOWN") {
      throw new Error(`Service ${serviceId} is currently unavailable.`);
    }

    // Call the specific service URL
    const url = `${service.url}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
    return await res.json();
  }
};

// --- COMPONENTS ---

const ServiceProfile = ({ user, onClose }: any) => {
  const [data, setData] = useState({ name: "", email: "", bio: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.callService("profile", `/profile/${user}`).then(setData).catch(console.error);
  }, [user]);

  const save = async () => {
    await api.callService("profile", `/profile/${user}`, { method: "POST", body: JSON.stringify(data) });
    setMsg("Saved!");
  };

  return (
    <div className="p-6 bg-white rounded border shadow h-full">
      <div className="flex justify-between mb-4">
         <h3 className="font-bold flex items-center gap-2"><Users size={18}/> S1: Profile</h3>
         <button onClick={onClose} className="text-red-500 font-bold">X</button>
      </div>
      <div className="space-y-4">
        <div>
           <label className="text-sm font-bold">Preferred Name</label>
           <input className="block w-full border p-2 rounded" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        </div>
        <div>
           <label className="text-sm font-bold">Bio</label>
           <textarea className="block w-full border p-2 rounded h-24" value={data.bio} onChange={e => setData({...data, bio: e.target.value})} />
        </div>
        <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"><Save size={16}/> Save Profile</button>
        {msg && <span className="text-green-600 font-bold">{msg}</span>}
      </div>
    </div>
  );
};

const ServiceTickets = ({ user, role, counselingMode, onClose }: any) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [sub, setSub] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const refresh = () => api.callService("tickets", "/tickets").then(setTickets).catch(e => setError(e.message));
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    await api.callService("tickets", "/tickets", { method: "POST", body: JSON.stringify({ subject: sub, description: desc, studentName: user }) });
    setSub(""); setDesc(""); refresh();
  };

  const pickup = async (id: string) => {
    await api.callService("tickets", `/tickets/${id}/pickup`, { method: "POST", body: JSON.stringify({ counselorName: user }) });
    refresh();
  };

  return (
    <div className="p-6 bg-white rounded border shadow h-full overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldAlert size={18}/> S2: Tickets</h3>
        <button onClick={onClose} className="text-red-500 font-bold">X</button>
      </div>
      
      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">Error: {error}</div>}

      {role === "student" && (
        <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-100">
          <h4 className="font-bold text-sm mb-2 text-blue-800">Create Ticket</h4>
          <input className="w-full border p-2 mb-2 rounded" value={sub} onChange={e => setSub(e.target.value)} placeholder="Subject" />
          <textarea className="w-full border p-2 mb-2 rounded" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
          <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm">Submit Ticket</button>
        </div>
      )}

      <div className="space-y-3">
        {tickets.length === 0 && <p className="text-gray-400">No tickets.</p>}
        {tickets.map(t => (
          <div key={t.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="font-bold flex justify-between">
              <span>#{t.id} {t.subject}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${t.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}>{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 my-2">{t.description}</p>
            <div className="text-xs text-gray-400">Student: {t.studentName} {t.counselorName && `| Counselor: ${t.counselorName}`}</div>
            
            {role === "counselor" && t.status === "OPEN" && (
              <button 
                disabled={!counselingMode}
                onClick={() => pickup(t.id)}
                className={`mt-3 w-full py-2 rounded text-sm font-bold ${counselingMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {counselingMode ? "Pick Up Ticket" : "Enable Counseling Mode First"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceBoard = ({ onClose }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  
  const refresh = () => api.callService("board", "/posts").then(setPosts).catch(console.error);
  useEffect(() => { refresh(); }, []);

  const post = async () => {
    await api.callService("board", "/posts", { method: "POST", body: JSON.stringify({ content: text, author: "Anon" }) });
    setText(""); refresh();
  };

  return (
    <div className="p-6 bg-white rounded border shadow h-full flex flex-col">
      <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18}/> S3: Board <button onClick={onClose} className="ml-auto text-red-500 font-bold">X</button></h3>
      <div className="flex gap-2 mb-4">
        <input className="flex-1 border p-2 rounded" value={text} onChange={e => setText(e.target.value)} placeholder="Say something..." />
        <button onClick={post} className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
         {posts.map(p => <div key={p.id} className="border-b p-3 text-sm">{p.content}</div>)}
      </div>
    </div>
  );
};

const ServiceAppointments = ({ user, onClose }: any) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selId, setSelId] = useState("");
  const [appt, setAppt] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Get Tickets
  useEffect(() => {
    api.callService("tickets", "/tickets").then(list => {
      setTickets(list.filter((t: any) => t.studentName === user || t.counselorName === user));
    }).catch(console.error);
  }, [user]);

  // 2. Get Appt details
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

  const renderLogic = () => {
    if (!selId) return <div className="text-gray-400 p-4">Select a ticket from the left.</div>;
    const t = tickets.find(x => x.id === selId);
    if (!t) return null;
    
    const isPickedUp = t.status === "PICKED_UP";
    const hasSlot = !!appt?.studentSlot;
    const isFirst = !appt?.hasVisited;

    if (!isPickedUp && isFirst) return (
      <div className="bg-yellow-50 p-6 rounded border border-yellow-200">
        <h4 className="font-bold text-yellow-800 mb-2">Ticket Pending</h4>
        <p className="mb-4 text-sm">Not picked up yet. Since it's your first time here, propose a time slot:</p>
        <div className="flex gap-2">
           <input id="s1" className="border p-2 rounded flex-1" placeholder="e.g. Mon 10am" />
           <button onClick={() => saveSlot((document.getElementById('s1') as any).value)} className="bg-yellow-600 text-white px-4 rounded">Save</button>
        </div>
      </div>
    );
    if (!isPickedUp && !isFirst) return (
       <div className="bg-orange-50 p-6 rounded border border-orange-200">
         <h4 className="font-bold text-orange-800">Waiting...</h4>
         <p className="text-sm mt-2">Counselor has not picked this up yet. Please check back later.</p>
         <div className="mt-2 text-xs text-gray-500">Your slot: {appt.studentSlot}</div>
       </div>
    );
    if (isPickedUp && hasSlot) return (
       <div className="bg-green-50 p-6 rounded border border-green-200">
          <h4 className="font-bold text-green-800">Matched!</h4>
          <p className="text-sm mt-2">Counselor: {t.counselorName}</p>
          <div className="bg-white p-2 mt-2 border rounded font-mono">{appt.studentSlot}</div>
       </div>
    );
    if (isPickedUp && !hasSlot) return (
      <div className="bg-blue-50 p-6 rounded border border-blue-200">
        <h4 className="font-bold text-blue-800">Picked Up!</h4>
        <p className="mb-4 text-sm">Good news! Your ticket was picked up. Please confirm your slot:</p>
        <div className="flex gap-2">
           <input id="s2" className="border p-2 rounded flex-1" placeholder="e.g. Tue 2pm" />
           <button onClick={() => saveSlot((document.getElementById('s2') as any).value)} className="bg-blue-600 text-white px-4 rounded">Confirm</button>
        </div>
      </div>
    );
    return <div>Loading state...</div>;
  };

  return (
    <div className="p-6 bg-white rounded border shadow h-full grid grid-cols-3 gap-4">
      <div className="col-span-1 border-r pr-4">
        <h4 className="font-bold text-gray-500 text-xs uppercase mb-2">Your Tickets</h4>
        {tickets.map(t => (
          <div key={t.id} onClick={() => setSelId(t.id)} className={`p-3 rounded cursor-pointer mb-2 ${selId === t.id ? "bg-blue-100 border-blue-300 border" : "bg-gray-50 hover:bg-gray-100"}`}>
            <div className="font-bold text-sm">#{t.id} {t.subject}</div>
            <div className="text-xs text-gray-500">{t.status}</div>
          </div>
        ))}
      </div>
      <div className="col-span-2">
        <div className="flex justify-between mb-4"><h3 className="font-bold flex items-center gap-2"><Calendar size={18}/> S4: Appointments</h3> <button onClick={onClose} className="text-red-500 font-bold">X</button></div>
        {renderLogic()}
      </div>
    </div>
  );
};

const ServiceCounseling = ({ isActive, onToggle, onClose }: any) => {
  return (
    <div className="p-6 bg-white rounded border shadow h-full flex flex-col items-center justify-center">
      <h3 className="font-bold mb-8 flex items-center gap-2 text-xl"><Phone size={24}/> S5: Counseling Center</h3>
      
      <div className="bg-red-50 p-4 rounded w-full mb-8 text-center border border-red-100">
         <div className="font-bold text-red-800 mb-2">Emergency Lines</div>
         <div className="text-sm text-red-600">Suicide Hotline: 988 | Campus Police: 911</div>
      </div>

      <div className="text-center p-6 bg-gray-50 rounded border w-full">
        <p className="mb-4 font-bold text-gray-700">Counselor Mode Status</p>
        <button onClick={onToggle} className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all ${isActive ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}>
          <Power size={32}/>
        </button>
        <p className={isActive ? "text-green-600 font-bold" : "text-gray-400"}>{isActive ? "ONLINE" : "OFFLINE"}</p>
      </div>
      
      <button onClick={onClose} className="mt-auto text-red-500 text-sm hover:underline">Close Service</button>
    </div>
  );
};

export default function App() {
  const [user] = useState("Student A"); // REMOVED setUser
  const [role, setRole] = useState<Role>("student");
  const [activeId, setActiveId] = useState<ServiceId | null>(null);
  const [registry, setRegistry] = useState<any>({});
  const [counselingMode, setCounselingMode] = useState(false);
  const [error, setError] = useState("");

  // Poll Registry every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api.discover()
        .then(data => {
            setRegistry(data);
            setError("");
        })
        .catch(() => setError("Cannot connect to Registry (S0). Is it running?"));
        
      // Also sync counseling mode
      api.callService("counseling", "/status").then(r => setCounselingMode(r.active)).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleCounseling = async () => {
    const res = await api.callService("counseling", "/toggle", { method: "POST" });
    setCounselingMode(res.active);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-100 min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded shadow-sm border">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded text-white"><Activity size={20}/></div>
            <div>
                <h1 className="text-xl font-bold">Microservices Demo</h1>
                <p className="text-xs text-gray-500">Render.com · Node.js · Independent Deployments</p>
            </div>
        </div>
        <div className="flex gap-4 items-center mt-4 md:mt-0">
          <div className="text-right">
             <div className="text-[10px] font-bold text-gray-400">CURRENT USER</div>
             <div className="text-sm font-bold">{user}</div>
          </div>
          <select value={role} onChange={e => setRole(e.target.value as Role)} className="border p-2 rounded bg-gray-50 text-sm font-medium">
            <option value="student">Role: Student</option>
            <option value="counselor">Role: Counselor</option>
            <option value="admin">Role: Admin</option>
          </select>
        </div>
      </header>

      {error && <div className="bg-red-500 text-white p-4 rounded mb-6 text-center font-bold shadow animate-pulse">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: MAIN WORKSPACE */}
        <div className="lg:col-span-8 h-[600px]">
          {activeId === "profile" && <ServiceProfile user={user} onClose={() => setActiveId(null)} />}
          {activeId === "tickets" && <ServiceTickets user={user} role={role} counselingMode={counselingMode} onClose={() => setActiveId(null)} />}
          {activeId === "board" && <ServiceBoard onClose={() => setActiveId(null)} />}
          {activeId === "appointments" && <ServiceAppointments user={user} onClose={() => setActiveId(null)} />}
          {activeId === "counseling" && <ServiceCounseling isActive={counselingMode} onToggle={toggleCounseling} onClose={() => setActiveId(null)} />}
          
          {/* REGISTRY VIEW (S0) */}
          {!activeId && (
            <div className="bg-white p-8 rounded shadow-sm border h-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Server/> Service Registry (S0)</h2>
              <p className="mb-6 text-gray-500">
                  Select a microservice to open its UI. The status below is fetched live from the backend registry.
                  If a service is "DOWN", you cannot open it.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "profile", name: "Profile Service" },
                  { id: "tickets", name: "Ticket Service" },
                  { id: "board", name: "Board Service" },
                  { id: "appointments", name: "Appt. Service" },
                  { id: "counseling", name: "Counseling Service" },
                ].map(item => {
                  const s = registry[item.id];
                  const isUp = s?.status === "UP";
                  return (
                    <div key={item.id} className={`border p-4 rounded flex flex-col justify-between transition-all ${isUp ? "bg-white hover:shadow-md" : "bg-gray-100 opacity-60 grayscale"}`}>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg">{item.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {isUp ? "ONLINE" : "OFFLINE"}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono mb-4 truncate">{s?.url || "Waiting for heartbeat..."}</div>
                      </div>
                      <button 
                        disabled={!isUp} 
                        onClick={() => setActiveId(item.id as ServiceId)}
                        className={`w-full py-2 rounded font-bold text-sm ${isUp ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                      >
                        {isUp ? "Open Service" : "Service Unavailable"}
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
          <div className="bg-slate-800 text-white p-6 rounded shadow-lg h-full">
            <h3 className="font-bold mb-6 flex items-center gap-2 border-b border-gray-600 pb-4"><Activity/> Admin Control Board</h3>
            
            {role !== "admin" ? (
                <div className="text-center py-10 text-gray-500">
                    <ShieldAlert size={48} className="mx-auto mb-4"/>
                    <p>Admin Access Only</p>
                    <p className="text-xs mt-2">Switch role in top right</p>
                </div>
            ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 mb-4">
                      Click to toggle service availability. This simulates a crash or manual deprovisioning in the registry.
                  </p>
                  {["profile", "tickets", "board", "appointments", "counseling"].map(name => (
                    <div key={name} className="flex justify-between items-center bg-slate-700 p-3 rounded hover:bg-slate-600 transition-colors">
                      <span className="capitalize font-mono text-sm">{name}</span>
                      <button 
                        onClick={() => api.toggleService(name)}
                        className={`w-20 py-1 rounded text-xs font-bold transition-all shadow ${registry[name]?.status === "UP" ? "bg-green-500 hover:bg-green-400 text-white" : "bg-red-500 hover:bg-red-400 text-white"}`}
                      >
                        {registry[name]?.status || "N/A"}
                      </button>
                    </div>
                  ))}
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-600">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">System Logs</h4>
                <div className="h-32 bg-black/30 rounded p-2 text-[10px] font-mono text-green-400 overflow-hidden">
                    {Object.keys(registry).length > 0 ? (
                        Object.keys(registry).map(k => (
                            <div key={k}>[REGISTRY] Found {k} at {registry[k].url}</div>
                        ))
                    ) : (
                        <span className="animate-pulse">Connecting to S0-Registry...</span>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
