import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock detail data (replace with apiService.getUser(id) later)
const mockUsers = {
  1: { id: 1, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', status: 'Active' },
  2: { id: 2, name: 'Jane Smith', phone: '+1 555 222 3333', email: 'jane@example.com', status: 'Suspended' }
};

const badgeClass = (status) => status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = mockUsers[id] || mockUsers[1];

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">⋮</button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-sm z-10">
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-50">Suspend User</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600">Delete User</button>
                <button onClick={() => { setOpen(false); navigate(-1); }} className="block w-full text-left px-3 py-2 hover:bg-gray-50">Back</button>
              </div>
            )}
          </div>
        </div>
        <dl className="text-sm">
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Name:</dt>
            <dd className="col-span-4 text-gray-800">{user.name}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Phone:</dt>
            <dd className="col-span-4 text-gray-800">{user.phone}</dd>
          </div>
            <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Email:</dt>
            <dd className="col-span-4 text-gray-800">{user.email}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Status:</dt>
            <dd className="col-span-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass(user.status)}`}>{user.status}</span></dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default UserDetailPage;
