import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock garage data (replace later with apiService.getGarage(id))
const mockGarages = {
  1: { id: 1, name: 'AAA Auto Garage', email: 'aaa@example.com', phone: '+92 301 9876543', owner: 'Ahmed Raza', location: 'Gulberg, Lahore', status: 'Active' }
};

const badgeClass = (status) => status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600';

const GarageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const garage = mockGarages[id] || mockGarages[1];

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
          <h2 className="text-lg font-semibold text-gray-800">Garage Details</h2>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">⋮</button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-sm z-10">
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-50">Suspend Garage</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600">Delete Garage</button>
                <button onClick={() => { setOpen(false); navigate(-1); }} className="block w-full text-left px-3 py-2 hover:bg-gray-50">Back</button>
              </div>
            )}
          </div>
        </div>
        <dl className="text-sm">
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Name:</dt>
            <dd className="col-span-4 text-gray-800">{garage.name}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Location:</dt>
            <dd className="col-span-4 text-gray-800">{garage.location}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Email:</dt>
            <dd className="col-span-4 text-gray-800">{garage.email}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Phone:</dt>
            <dd className="col-span-4 text-gray-800">{garage.phone}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Status:</dt>
            <dd className="col-span-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass(garage.status)}`}>{garage.status}</span></dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Rating:</dt>
            <dd className="col-span-4 text-gray-800">{garage.rating}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default GarageDetailPage;
