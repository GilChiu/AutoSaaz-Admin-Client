import React, { useState } from "react";
import { useParams } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const cls = status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
};

const OrderCard = ({ order, onAssign, onComplete }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
      <div>
        <div className="text-xs uppercase text-gray-500">User</div>
        <div className="text-sm text-gray-800">{order.user}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Garage</div>
        <div className="text-sm text-gray-800">{order.garage}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Pickup Schedule</div>
        <div className="text-sm text-gray-800">{order.pickup}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Recovery Status</div>
        <div className="text-sm text-gray-800">{order.recoveryStatus}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Quotation</div>
        <div className="text-sm text-gray-800">{order.quotation} AED</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Inspection Report</div>
        <div className="text-sm text-gray-800 truncate" title={order.inspection}>{order.inspection}</div>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="text-xs text-gray-600">
        <div className="font-medium">Payment Status</div>
        <div>Paid via Escrow</div>
      </div>
      <div className="flex items-center gap-3">
        {order.status !== 'Completed' && (
          <button onClick={() => onAssign(order)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Assign / Change Garage</button>
        )}
        {order.status === 'In Progress' ? (
          <button onClick={() => onComplete(order)} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md">Mark as Completed</button>
        ) : order.status === 'Completed' ? (
          <StatusBadge status="Completed" />
        ) : null}
      </div>
    </div>
  </div>
);

const Modal = ({ open, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl">
        <div className="p-6">{children}</div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          {footer}
        </div>
      </div>
      <div className="absolute inset-0" onClick={onClose} />
    </div>
  );
};

const OrderManagementPage = () => {
  const { status } = useParams();
  const tab = (status === 'in-progress') ? 'In Progress' : (status === 'completed') ? 'Completed' : 'Pending';
  const [search, setSearch] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const orders = [
    // Pending
    { id: 101, user: 'Aman Khan', garage: 'AAA Auto Garage', pickup: 'July 2, 2025 – 10:00 AM', recoveryStatus: 'Awaiting Pickup', quotation: 1500, inspection: 'Oil leak detected, filter clogged', status: 'Pending' },
    { id: 102, user: 'Sara Malik', garage: 'Quick Fix Motors', pickup: 'July 3, 2025 – 11:30 AM', recoveryStatus: 'Assigned', quotation: 980, inspection: 'Brake pads worn out', status: 'Pending' },
    { id: 103, user: 'Bilal Ahmed', garage: 'Metro Auto Works', pickup: 'July 3, 2025 – 02:15 PM', recoveryStatus: 'Driver En Route', quotation: 2200, inspection: 'AC not cooling; condenser suspected', status: 'Pending' },
    { id: 104, user: 'Hira Yousaf', garage: 'City Car Care', pickup: 'July 4, 2025 – 09:00 AM', recoveryStatus: 'Awaiting Confirmation', quotation: 650, inspection: 'Battery weak; terminals corroded', status: 'Pending' },
    { id: 105, user: 'Usman Tariq', garage: 'Auto Care Center', pickup: 'July 4, 2025 – 04:45 PM', recoveryStatus: 'Assigned', quotation: 1340, inspection: 'Coolant leak from radiator hose', status: 'Pending' },

    // In Progress
    { id: 201, user: 'Nadia Shah', garage: 'AAA Auto Garage', pickup: 'July 1, 2025 – 01:00 PM', recoveryStatus: 'Diagnosing', quotation: 1700, inspection: 'Check-engine light; misfire on cyl 3', status: 'In Progress' },
    { id: 202, user: 'Ali Raza', garage: 'Quick Fix Motors', pickup: 'July 2, 2025 – 03:30 PM', recoveryStatus: 'Parts Ordered', quotation: 2450, inspection: 'Front suspension noise; bushings cracked', status: 'In Progress' },
    { id: 203, user: 'Maryam Zafar', garage: 'Metro Auto Works', pickup: 'July 2, 2025 – 10:30 AM', recoveryStatus: 'Under Repair', quotation: 1130, inspection: 'Tire puncture + rim bend', status: 'In Progress' },
    { id: 204, user: 'Hamza Javed', garage: 'City Car Care', pickup: 'July 3, 2025 – 08:45 AM', recoveryStatus: 'Painting', quotation: 3200, inspection: 'Rear bumper scratches; repaint required', status: 'In Progress' },
    { id: 205, user: 'Mehwish Khan', garage: 'Auto Care Center', pickup: 'July 3, 2025 – 05:00 PM', recoveryStatus: 'Quality Check', quotation: 760, inspection: 'Windshield washer pump faulty', status: 'In Progress' },

    // Completed
    { id: 301, user: 'Junaid Iqbal', garage: 'AAA Auto Garage', pickup: 'June 29, 2025 – 11:00 AM', recoveryStatus: 'Completed', quotation: 1950, inspection: 'Clutch plate replaced', status: 'Completed' },
    { id: 302, user: 'Ayesha Noor', garage: 'Quick Fix Motors', pickup: 'June 28, 2025 – 04:20 PM', recoveryStatus: 'Completed', quotation: 430, inspection: 'Engine oil + filter changed', status: 'Completed' },
    { id: 303, user: 'Zohaib Anwar', garage: 'City Car Care', pickup: 'June 30, 2025 – 09:30 AM', recoveryStatus: 'Completed', quotation: 2890, inspection: 'Alternator replaced; belt adjusted', status: 'Completed' },
    { id: 304, user: 'Mahnoor Ali', garage: 'Metro Auto Works', pickup: 'June 27, 2025 – 02:00 PM', recoveryStatus: 'Completed', quotation: 1490, inspection: 'Brake pads + discs replaced', status: 'Completed' },
    { id: 305, user: 'Umer Farooq', garage: 'Auto Care Center', pickup: 'June 26, 2025 – 12:15 PM', recoveryStatus: 'Completed', quotation: 870, inspection: 'Wheel alignment + balancing', status: 'Completed' },
  ];

  const filtered = orders.filter(o => (tab ? o.status === tab : true) && (!search || o.user.toLowerCase().includes(search.toLowerCase()) || o.garage.toLowerCase().includes(search.toLowerCase())));

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  // reset page when filters change
  React.useEffect(() => { setPage(1); }, [tab, search]);

  const openAssign = (order) => { setActiveOrder(order); setAssignOpen(true); };
  const openComplete = (order) => { setActiveOrder(order); setCompleteOpen(true); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by User & Garage name"
          className="w-full sm:w-[420px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm">Search</button>
      </div>

      <div className="flex gap-6">
        {/* Orders list only; subtabs are now in sidebar */}
        <div className="flex-1 space-y-4">
          {paged.map(order => (
            <div key={order.id} className="relative">
              {tab === 'Pending' && (
                <div className="absolute top-4 right-4"><StatusBadge status="Pending" /></div>
              )}
              {tab === 'In Progress' && (
                <div className="absolute top-4 right-4"><StatusBadge status="In Progress" /></div>
              )}
              {tab === 'Completed' && (
                <div className="absolute top-4 right-4"><StatusBadge status="Completed" /></div>
              )}
              <OrderCard order={order} onAssign={openAssign} onComplete={openComplete} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">No orders found.</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`px-3 py-1 rounded-md text-sm ${n === page ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next</button>
          </div>
        </div>
      )}

      {/* Assign / Change Garage Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)}
        footer={
          <>
            <button onClick={() => setAssignOpen(false)} className="px-5 py-2 rounded-md border border-gray-300">Cancel</button>
            <button onClick={() => setAssignOpen(false)} className="px-5 py-2 rounded-md bg-orange-500 text-white">Assign Garage</button>
          </>
        }>
        <h2 className="text-2xl font-semibold mb-2">Assign / Change Garage</h2>
        <div className="text-sm text-gray-600 mb-4">Order ID: {activeOrder?.id}</div>
        <div className="text-sm font-medium mb-4">Current Garage: {activeOrder?.garage}</div>
        <div className="space-y-3">
          {[1,2].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="font-medium">AAA Auto Garage</div>
              <div className="text-sm text-gray-600">Dubai Marina</div>
              <div className="mt-1 text-sm text-gray-700">★ 4.8 • Engine Repair, Oil Change</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Complete Order Modal */}
      <Modal open={completeOpen} onClose={() => setCompleteOpen(false)}
        footer={
          <>
            <button onClick={() => setCompleteOpen(false)} className="px-5 py-2 rounded-md border border-gray-300">Cancel</button>
            <button onClick={() => setCompleteOpen(false)} className="px-5 py-2 rounded-md bg-orange-500 text-white">Complete Order</button>
          </>
        }>
        <h2 className="text-2xl font-semibold mb-2">Complete Order</h2>
        <div className="text-sm text-gray-600 mb-4">Order ID: {activeOrder?.id}</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Complete Order *</label>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px]" placeholder="Describe The Final Status...." />
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="font-medium mb-3">Completion Checklist</div>
            <div className="space-y-3 text-sm text-gray-700">
              {['Service work completed as per quotation','Customer has been notified','Payment has been processed','Vehicle is ready for pickup/delivery'].map((t,i) => (
                <label key={i} className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" /> {t}</label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagementPage;
