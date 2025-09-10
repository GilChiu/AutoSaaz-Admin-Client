import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const GarageManagementPage = () => {
  const [garages] = useState([
    {
      id: 1,
      name: "AAA Auto Garage",
      owner: "Ahmed Raza",
      contact: "+92 301 9876543",
      area: "Gulberg",
      rating: 4.5,
      status: "Active"
    },
    {
      id: 2,
      name: "AAA Auto Garage",
      owner: "Ahmed Raza",
      contact: "+92 301 9876543",
      area: "Gulberg",
      rating: 4.5,
      status: "Active"
    },
    {
      id: 3,
      name: "AAA Auto Garage",
      owner: "Ahmed Raza",
      contact: "+92 301 9876543",
      area: "Gulberg",
      rating: 4.5,
      status: "Active"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredGarages = garages.filter(garage => {
    const term = searchTerm.toLowerCase();
    return !term || garage.name.toLowerCase().includes(term);
  });

  // status displayed as plain text per design

  // rating shown as number + star symbol to match design

  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Garage Management</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by garage name"
          className="w-full sm:w-[520px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm">Search</button>
      </div>

      {/* Garages Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Owner</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Area</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGarages.map((garage) => (
              <tr key={garage.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/garages/${garage.id}`)}>
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{garage.name}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{garage.owner}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{garage.contact}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{garage.area}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{garage.status}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{garage.rating} ★</td>
                <td className="px-5 py-4 text-right text-sm font-medium relative" ref={openMenu === garage.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(m => m === garage.id ? null : garage.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenu === garage.id && (
                    <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1 text-sm">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(null); navigate(`/garages/${garage.id}`); }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                        >View Details</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(null); /* suspend logic */ }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                        >Suspend Garage</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(null); /* delete logic */ }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                        >Delete Garage</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
  <div className="text-sm text-gray-600">Showing {filteredGarages.length} of {garages.length} garages</div>
  <div className="text-xs text-gray-400">Pagination disabled (static mock)</div>
      </div>
    </div>
  );
};

export default GarageManagementPage;
