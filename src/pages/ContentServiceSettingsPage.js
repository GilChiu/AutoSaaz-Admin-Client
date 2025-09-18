import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

const initialServices = [
  { service: 'Oil Change', basePrice: '249.99 AED', duration: '30 min', bookings: '1,234', status: 'Active', commission: '5%' },
  { service: 'Brake Repair', basePrice: '299.99 AED', duration: '120 min', bookings: '567', status: 'Active', commission: '7%' },
  { service: 'Tire Rotation', basePrice: '299.99 AED', duration: '45 min', bookings: '234', status: 'Active', commission: '10%' },
];

const servicesCatalog = ['Oil Change', 'Brake Repair', 'Tire Rotation', 'Engine Diagnostic', 'AC Service'];

const Badge = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{children}</span>
);

const Modal = ({ open, onClose, onConfirm }) => {
  const [selected, setSelected] = useState('');
  const [commission, setCommission] = useState('');

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[680px] max-w-[92vw] p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">Add Service Commission</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <div className="text-gray-600 mb-1">Service</div>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" value={selected} onChange={(e)=>setSelected(e.target.value)}>
              <option value="">Select Service</option>
              {servicesCatalog.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Commission %</div>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter Commission In Service" value={commission} onChange={(e)=>setCommission(e.target.value)} />
          </div>
        </div>
        <div className="mt-8 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">Cancel</button>
          <button onClick={() => onConfirm(selected, commission)} className="px-5 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white">Confirm</button>
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="text-sm text-gray-500 mb-2">Type</div>
          <div className="bg-white rounded-md border border-gray-200 p-4 space-y-2 max-h-48 overflow-auto">
            {servicesCatalog.map(s => (
              <div key={s} className="text-gray-800">{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentServiceSettingsPage = () => {
  const [rows, setRows] = useState(initialServices);
  const [open, setOpen] = useState(false);
  // TODO: Replace with real-time garage name from backend once available
  const [garageName] = useState('AAA Auto Garage');

  const onConfirm = (service, commission) => {
    if (!service || !commission) { setOpen(false); return; }
    setRows(prev => prev.map(r => r.service === service ? { ...r, commission: commission.endsWith('%') ? commission : `${commission}%` } : r));
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Content, Notification & CMS Controls</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Service Setting</h2>
          <div className="mt-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4">
              <div className="text-gray-800 font-semibold">{garageName}</div>
              <button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-md">+ Add Commission</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Base Price</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map(r => (
                    <tr key={r.service} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-800">{r.service}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{r.basePrice}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{r.duration}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{r.bookings}</td>
                      <td className="px-5 py-3 text-sm text-gray-800"><Badge>{r.status}</Badge></td>
                      <td className="px-5 py-3 text-sm text-gray-800">{r.commission}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setOpen(true)} className="inline-flex items-center text-indigo-600 hover:text-indigo-700">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} onConfirm={onConfirm} />
    </div>
  );
};

export default ContentServiceSettingsPage;
