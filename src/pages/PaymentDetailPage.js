import React from 'react';
import { useParams } from 'react-router-dom';

const payments = {
  TXN001: {
    id: 'TXN001', status: 'Completed', bookingId: 'BK001', serviceType: 'Oil Change & Filter Replacement',
    method: 'Credit Card', date: 'January 15, 2024 at 02:30 AM', amount: 1200, fee: 36, type: 'User Payment',
    user: { name: 'Ali Khan', email: 'ali.khan@email.com', phone: '+971501234567' },
    vehicle: { makeModel: 'Toyota Camry', year: 2020, plate: 'A12345' },
    garage: { name: 'AutoFix', address: 'Dubai Marina' }
  },
  TXN002: {
    id: 'TXN002', status: 'Pending', bookingId: 'BK001', serviceType: 'Oil Change & Filter Replacement',
    method: 'Credit Card', date: 'January 15, 2024 at 02:30 AM', amount: 1200, fee: 36, type: 'User Payment',
    user: { name: 'Ali Khan', email: 'ali.khan@email.com', phone: '+971501234567' },
    vehicle: { makeModel: 'Toyota Camry', year: 2020, plate: 'A12345' },
    garage: { name: 'AutoFix', address: 'Dubai Marina' }
  }
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm py-1">
    <div className="text-gray-600">{label}</div>
    <div className="text-gray-900 font-medium">{value}</div>
  </div>
);

const PaymentDetailPage = () => {
  const { id } = useParams();
  const data = payments[id] || payments.TXN001;
  const net = (data.amount - data.fee).toLocaleString();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Details card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Booking ID</div>
                <div className="text-sm text-gray-900">{data.bookingId}</div>

                <div className="mt-3 text-sm text-gray-500">Payment Method</div>
                <div className="text-sm text-gray-900">{data.method}</div>

                <div className="mt-3 text-sm text-gray-500">Amount</div>
                <div className="text-sm text-gray-900 font-semibold">{data.amount.toLocaleString()} AED</div>

                <div className="mt-3 text-sm text-gray-500">Net Amount</div>
                <div className="text-sm text-gray-900 font-semibold">{net} AED</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Service Type</div>
                <div className="text-sm text-gray-900">{data.serviceType}</div>

                <div className="mt-3 text-sm text-gray-500">Transaction Date</div>
                <div className="text-sm text-gray-900">{data.date}</div>

                <div className="mt-3 text-sm text-gray-500">Transaction Fee</div>
                <div className="text-sm text-gray-900">{data.fee} AED</div>

                <div className="mt-3 text-sm text-gray-500">Type</div>
                <div className="text-sm text-gray-900">{data.type}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-sm">{data.user.name}</div>
              <div className="mt-3 text-sm text-gray-500">Email</div>
              <div className="text-sm">{data.user.email}</div>
              <div className="mt-3 text-sm text-gray-500">Phone</div>
              <div className="text-sm">{data.user.phone}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Vehicle Information</h3>
              <div className="text-sm text-gray-500">Make & Model</div>
              <div className="text-sm">{data.vehicle.makeModel}</div>
              <div className="mt-3 text-sm text-gray-500">Year</div>
              <div className="text-sm">{data.vehicle.year}</div>
              <div className="mt-3 text-sm text-gray-500">Plate Number</div>
              <div className="text-sm">{data.vehicle.plate}</div>
            </div>
          </div>
        </div>

        {/* Right column: Quick Actions + Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${data.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{data.status}</span>
            </div>
            {data.status === 'Completed' ? (
              <div className="text-sm text-gray-500">No actions available</div>
            ) : (
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm">Release Payment</button>
                <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm">Flag Payment</button>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
            <SummaryRow label="Subtotal:" value={`${(data.amount - data.fee).toLocaleString()} AED`} />
            <SummaryRow label="Transaction Fee:" value={`${data.fee} AED`} />
            <SummaryRow label="Total Amount:" value={`${data.amount.toLocaleString()} AED`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailPage;