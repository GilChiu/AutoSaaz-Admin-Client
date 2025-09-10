import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
  const [users] = useState([
    { id: 1, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: true, totalSale: 1200 },
    { id: 2, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: true, totalSale: 1200 },
    { id: 3, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: true, totalSale: 1200 },
    { id: 4, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: false, totalSale: 1200 },
    { id: 5, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: false, totalSale: 1200 },
    { id: 6, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: false, totalSale: 1200 },
    { id: 7, name: 'Ali Khan', phone: '+92 300 1234567', email: 'ali@example.com', carModel: 'Honda Civic 2022', bookings: 6, validated: false, totalSale: 1200 },
  ]);

  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase();
    return !term || u.name.toLowerCase().includes(term) || u.phone.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const formatSale = (n) => n.toLocaleString('en-US');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            className="w-full sm:w-96 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {/* search button intentionally no-op since live filtering */}}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm"
          >Search</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Car Model</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Verification</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Sale</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{user.phone}</td>
                <td className="px-5 py-4 text-sm text-gray-700 max-w-[140px] truncate" title={user.email}>{user.email}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{user.carModel}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{user.bookings}</td>
                <td className="px-5 py-4 text-sm flex items-center gap-1">
                  {user.validated ? (
                    <>
                      <span className="text-green-600">Validated</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <span className="text-red-600">UnValidated</span>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{formatSale(user.totalSale)} AED</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-md shadow"
                  >View Details</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
  <div className="text-sm text-gray-600">Showing {filteredUsers.length} of {users.length} users</div>
  <div className="text-xs text-gray-400">Pagination disabled (static mock)</div>
      </div>
    </div>
  );
};

export default UserManagementPage;
