import React, { useState } from 'react';
import Map from './Map';
import { Zone, Resource, Poll, UserProfile } from '../types';
import { MapPin, Shield, AlertTriangle, Info, CheckCircle, User, Users, ClipboardList, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  userRole: 'citizen' | 'authority';
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'polls' | 'gov'>(userRole === 'citizen' ? 'map' : 'gov');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({ fullName: '', relation: '', idNumber: '' });
  const [newZone, setNewZone] = useState({ name: '', status: 'safe' as any, description: '' });
  const [newResource, setNewResource] = useState({ name: '', type: 'shelter' as any, description: '', lat: 28.6139, lng: 77.2090 });

  // Poll responses state
  const [pollResponses, setPollResponses] = useState<Record<string, string>>({});
  const [submittedPolls, setSubmittedPolls] = useState<Set<string>>(new Set());

  // Mock data for zones and resources (using state to allow "adding")
  const [zones, setZones] = useState<Zone[]>([
    {
      id: '1',
      name: 'Central Safe Zone',
      status: 'safe',
      coordinates: [
        { lat: 28.6139, lng: 77.2090 },
        { lat: 28.6239, lng: 77.2190 },
        { lat: 28.6139, lng: 77.2290 },
        { lat: 28.6039, lng: 77.2190 }
      ],
      description: 'Heavily guarded area with active relief camps.'
    },
    {
      id: '2',
      name: 'North Conflict Zone',
      status: 'warring',
      coordinates: [
        { lat: 28.6539, lng: 77.2090 },
        { lat: 28.6639, lng: 77.2190 },
        { lat: 28.6539, lng: 77.2290 },
        { lat: 28.6439, lng: 77.2190 }
      ],
      description: 'Active shelling reported. Avoid this area.'
    }
  ]);

  const [resources, setResources] = useState<Resource[]>([
    {
      id: 'r1',
      type: 'shelter',
      name: 'Relief Camp A',
      lat: 28.6150,
      lng: 77.2150,
      description: 'Capacity: 500 people. Currently 80% full.',
      contact: '+91 98765 43210'
    },
    {
      id: 'r2',
      type: 'medical',
      name: 'Mobile Hospital 1',
      lat: 28.6180,
      lng: 77.2200,
      description: 'Emergency trauma care available.',
      contact: '102'
    }
  ]);

  const [familyMembers, setFamilyMembers] = useState([
    { name: "Priya Sharma", relation: "Spouse", id: "AADHAR-XXXX-XXXX-5678", verified: true },
    { name: "Rahul Sharma", relation: "Son", id: "AADHAR-XXXX-XXXX-9012", verified: false }
  ]);

  const mockPolls: Poll[] = [
    {
      id: 'p1',
      question: 'Current food supply status in your area?',
      options: ['Sufficient', 'Moderate', 'Critical', 'No Supply'],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      active: true
    }
  ];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.fullName || !newMember.relation || !newMember.idNumber) return;
    setFamilyMembers([...familyMembers, { 
      name: newMember.fullName, 
      relation: newMember.relation, 
      id: `AADHAR-XXXX-XXXX-${newMember.idNumber.slice(-4)}`, 
      verified: false 
    }]);
    setIsAddingMember(false);
    setNewMember({ fullName: '', relation: '', idNumber: '' });
  };

  const handlePollSubmit = (pollId: string) => {
    if (!pollResponses[pollId]) return;
    setSubmittedPolls(prev => new Set(prev).add(pollId));
  };

  const handleManualZoneAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = 28.6139 + (Math.random() - 0.5) * 0.1;
    const lng = 77.2090 + (Math.random() - 0.5) * 0.1;
    const offset = 0.005;
    const zone: Zone = {
      id: Math.random().toString(),
      name: newZone.name || 'New Zone',
      status: newZone.status,
      description: newZone.description,
      coordinates: [
        { lat: lat + offset, lng: lng - offset },
        { lat: lat + offset, lng: lng + offset },
        { lat: lat - offset, lng: lng + offset },
        { lat: lat - offset, lng: lng - offset }
      ]
    };
    setZones([...zones, zone]);
    setNewZone({ name: '', status: 'safe', description: '' });
  };

  const handleManualResourceAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const res: Resource = {
      id: Math.random().toString(),
      name: newResource.name || 'New Resource',
      type: newResource.type,
      lat: newResource.lat,
      lng: newResource.lng,
      description: newResource.description
    };
    setResources([...resources, res]);
    setNewResource({ name: '', type: 'shelter', description: '', lat: 28.6139, lng: 77.2090 });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingResource) {
      const res: Resource = {
        id: Math.random().toString(),
        name: newResource.name || 'New Resource',
        type: newResource.type,
        lat,
        lng,
        description: newResource.description
      };
      setResources([...resources, res]);
      setIsAddingResource(false);
      setNewResource({ name: '', type: 'shelter', description: '' });
    } else if (isAddingZone) {
      // For simplicity, create a small square around the click
      const offset = 0.005;
      const zone: Zone = {
        id: Math.random().toString(),
        name: newZone.name || 'New Zone',
        status: newZone.status,
        description: newZone.description,
        coordinates: [
          { lat: lat + offset, lng: lng - offset },
          { lat: lat + offset, lng: lng + offset },
          { lat: lat - offset, lng: lng + offset },
          { lat: lat - offset, lng: lng - offset }
        ]
      };
      setZones([...zones, zone]);
      setIsAddingZone(false);
      setNewZone({ name: '', status: 'safe', description: '' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-white/10 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg shadow-inner">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">RAPID CRISIS RESPONSE</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Government of India • Emergency Services</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium">{userRole === 'citizen' ? 'Verified Citizen' : 'Authority Officer'}</span>
            <span className={cn(
              "text-[10px] font-bold uppercase",
              userRole === 'citizen' ? "text-emerald-500" : "text-red-500"
            )}>Status: {userRole === 'citizen' ? 'Secure' : 'Active Duty'}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="flex md:flex-col w-full md:w-20 bg-[#141414] border-r border-white/10 p-2 md:p-4 gap-4 justify-around md:justify-start z-20">
          <NavButton 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            icon={<MapPin className="w-6 h-6" />} 
            label="Map" 
          />
          {userRole === 'citizen' && (
            <>
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<User className="w-6 h-6" />} 
                label="Profile" 
              />
              <NavButton 
                active={activeTab === 'polls'} 
                onClick={() => setActiveTab('polls')} 
                icon={<ClipboardList className="w-6 h-6" />} 
                label="Polls" 
              />
            </>
          )}
          {userRole === 'authority' && (
            <NavButton 
              active={activeTab === 'gov'} 
              onClick={() => setActiveTab('gov')} 
              icon={<Shield className="w-6 h-6" />} 
              label="Gov" 
            />
          )}
        </nav>

        {/* Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          {activeTab === 'map' && (
            <div className="w-full h-full relative">
              <Map 
                zones={zones} 
                resources={resources} 
                onZoneClick={setSelectedZone}
                onResourceClick={setSelectedResource}
                onMapClick={handleMapClick}
              />
              
              {/* Authority Map Controls */}
              {userRole === 'authority' && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <button 
                    onClick={() => { setIsAddingZone(!isAddingZone); setIsAddingResource(false); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                      isAddingZone ? "bg-red-600 border-red-500 text-white" : "bg-black/80 border-white/20 text-white hover:bg-white/10"
                    )}
                  >
                    {isAddingZone ? "Click Map to Place Zone" : "+ Mark Zone"}
                  </button>
                  <button 
                    onClick={() => { setIsAddingResource(!isAddingResource); setIsAddingZone(false); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                      isAddingResource ? "bg-blue-600 border-blue-500 text-white" : "bg-black/80 border-white/20 text-white hover:bg-white/10"
                    )}
                  >
                    {isAddingResource ? "Click Map to Place Resource" : "+ Add Resource"}
                  </button>
                </div>
              )}

              {/* Overlay Info Panels */}
              {selectedZone && (
                <div className="absolute top-4 right-4 w-80 bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{selectedZone.name}</h3>
                    <button onClick={() => setSelectedZone(null)} className="text-zinc-500 hover:text-white">×</button>
                  </div>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold uppercase mb-3",
                    selectedZone.status === 'safe' ? "bg-emerald-500/20 text-emerald-500" : 
                    selectedZone.status === 'warring' ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
                  )}>
                    {selectedZone.status === 'safe' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {selectedZone.status}
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedZone.description}</p>
                </div>
              )}

              {selectedResource && (
                <div className="absolute top-4 right-4 w-80 bg-black/90 p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{selectedResource.name}</h3>
                    <button onClick={() => setSelectedResource(null)} className="text-zinc-500 hover:text-white">×</button>
                  </div>
                  <div className="text-[10px] font-bold uppercase text-blue-400 mb-3">{selectedResource.type}</div>
                  <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{selectedResource.description}</p>
                  {selectedResource.contact && (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-mono">{selectedResource.contact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-6 bg-[#141414] rounded-2xl border border-white/10 shadow-xl">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-emerald-500/30">
                  <User className="w-12 h-12 text-zinc-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">Aditya Sharma</h2>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase rounded border border-emerald-500/30">Verified</span>
                  </div>
                  <p className="text-zinc-500 text-sm font-mono mt-1">ID: AADHAR-XXXX-XXXX-1234</p>
                </div>
              </div>

              {/* Family Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-500" />
                    Family Members
                  </h3>
                  <button 
                    onClick={() => setIsAddingMember(true)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    + Add Member
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.map((member, idx) => (
                    <FamilyCard key={idx} name={member.name} relation={member.relation} id={member.id} verified={member.verified} />
                  ))}
                </div>
              </div>

              {/* Add Member Modal */}
              {isAddingMember && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#141414] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Add Family Member</h3>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newMember.fullName}
                          onChange={e => setNewMember({...newMember, fullName: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Relation</label>
                        <select 
                          required 
                          value={newMember.relation}
                          onChange={e => setNewMember({...newMember, relation: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Parent">Parent</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Aadhar Number</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={12}
                          value={newMember.idNumber}
                          onChange={e => setNewMember({...newMember, idNumber: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none font-mono"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setIsAddingMember(false)}
                          className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                        >
                          Add Member
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="p-8 max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-red-500" />
                Active Polls & Forms
              </h2>
              <p className="text-zinc-500 text-sm">Your feedback helps the government allocate resources effectively. Please respond to the following enquiries.</p>
              
              {mockPolls.map(poll => (
                <div key={poll.id} className="p-6 bg-[#141414] rounded-2xl border border-white/10 shadow-xl space-y-4">
                  <h4 className="font-bold text-lg leading-tight">{poll.question}</h4>
                  {submittedPolls.has(poll.id) ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Response Submitted Successfully</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {poll.options.map((option, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setPollResponses({ ...pollResponses, [poll.id]: option })}
                            className={cn(
                              "w-full p-4 text-left border rounded-xl transition-all group flex items-center justify-between",
                              pollResponses[poll.id] === option 
                                ? "bg-red-600/10 border-red-500/50" 
                                : "bg-white/5 hover:bg-white/10 border-white/10"
                            )}
                          >
                            <span className="text-sm font-medium">{option}</span>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 transition-colors",
                              pollResponses[poll.id] === option ? "border-red-500 bg-red-500" : "border-zinc-700 group-hover:border-red-500"
                            )} />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Expires in 14 hours</span>
                        <button 
                          onClick={() => handlePollSubmit(poll.id)}
                          disabled={!pollResponses[poll.id]}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-600/20"
                        >
                          Submit Response
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gov' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              <div className="p-6 bg-red-600/10 border border-red-600/30 rounded-2xl">
                <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6" />
                  Government Authority Portal
                </h2>
                <p className="text-zinc-400 text-sm">Restricted access. This portal is for authorized personnel only. All actions are logged and tracked.</p>
              </div>

              {/* Manual Marking Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#141414] p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Mark Safe/Danger Zone
                  </h3>
                  <form onSubmit={handleManualZoneAdd} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Zone Name"
                      value={newZone.name}
                      onChange={e => setNewZone({...newZone, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                    />
                    <select 
                      value={newZone.status}
                      onChange={e => setNewZone({...newZone, status: e.target.value as any})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                    >
                      <option value="safe">Safe Zone</option>
                      <option value="warring">Warring Zone</option>
                      <option value="danger">Dangerous Zone</option>
                    </select>
                    <textarea 
                      placeholder="Description"
                      value={newZone.description}
                      onChange={e => setNewZone({...newZone, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none h-20"
                    />
                    <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl uppercase tracking-widest transition-colors">
                      Mark Zone
                    </button>
                  </form>
                </div>

                <div className="bg-[#141414] p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Add Supply Center
                  </h3>
                  <form onSubmit={handleManualResourceAdd} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Center Name"
                      value={newResource.name}
                      onChange={e => setNewResource({...newResource, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                    />
                    <select 
                      value={newResource.type}
                      onChange={e => setNewResource({...newResource, type: e.target.value as any})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                    >
                      <option value="shelter">Shelter</option>
                      <option value="medical">Medical Center</option>
                      <option value="food">Food Supply</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" step="any" placeholder="Latitude"
                        value={newResource.lat}
                        onChange={e => setNewResource({...newResource, lat: parseFloat(e.target.value)})}
                        className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                      />
                      <input 
                        type="number" step="any" placeholder="Longitude"
                        value={newResource.lng}
                        onChange={e => setNewResource({...newResource, lng: parseFloat(e.target.value)})}
                        className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                      />
                    </div>
                    <textarea 
                      placeholder="Capacity/Details"
                      value={newResource.description}
                      onChange={e => setNewResource({...newResource, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none h-20"
                    />
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl uppercase tracking-widest transition-colors">
                      Add Center
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GovStatCard label="Total Registered" value="12,450" color="text-white" />
                <GovStatCard label="Verified Citizens" value="8,920" color="text-emerald-500" />
                <GovStatCard label="Critical Requests" value="142" color="text-red-500" />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Actor</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <ActivityRow time="10:45 AM" action="Zone Update: Central Safe" actor="Admin_04" status="Success" />
                      <ActivityRow time="09:30 AM" action="New Poll Created: Food Supply" actor="Admin_01" status="Success" />
                      <ActivityRow time="08:15 AM" action="Resource Added: Medical Camp" actor="Admin_04" status="Success" />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="px-6 py-2 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Network: 2G (Low Bandwidth Mode)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Database: Synced</span>
          </div>
        </div>
        <div>
          <span>Last Updated: 24 Mar 2026 10:00 UTC</span>
        </div>
      </footer>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 group",
      active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    )}
  >
    {icon}
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const FamilyCard: React.FC<{ name: string; relation: string; id: string; verified: boolean }> = ({ name, relation, id, verified }) => (
  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
    <div>
      <h4 className="font-bold text-sm">{name}</h4>
      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{relation}</p>
      <p className="text-[10px] font-mono text-zinc-600 mt-1">{id}</p>
    </div>
    {verified ? (
      <div className="flex items-center gap-1 text-emerald-500">
        <CheckCircle className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase">Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-amber-500">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase">Pending</span>
      </div>
    )}
  </div>
);

const GovStatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="p-6 bg-[#141414] rounded-2xl border border-white/10 shadow-xl">
    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</span>
    <div className={cn("text-3xl font-bold mt-1", color)}>{value}</div>
  </div>
);

const ActivityRow: React.FC<{ time: string; action: string; actor: string; status: string }> = ({ time, action, actor, status }) => (
  <tr className="hover:bg-white/5 transition-colors">
    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{time}</td>
    <td className="px-6 py-4 font-medium">{action}</td>
    <td className="px-6 py-4 text-zinc-400">{actor}</td>
    <td className="px-6 py-4">
      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded border border-emerald-500/20">{status}</span>
    </td>
  </tr>
);

export default Dashboard;
