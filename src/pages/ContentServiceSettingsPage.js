import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { getAllGaragesWithServices, setServiceCommission } from '../services/serviceCommissions.service';

const Badge = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{children}</span>
);

const Modal = ({ open, onClose, onConfirm, selectedService }) => {
  const [commission, setCommission] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedService && open) {
      setCommission(selectedService.commissionPercentage?.toString() || '');
    }
  }, [selectedService, open]);

  const handleConfirm = async () => {
    if (!commission || !selectedService) {
      onClose();
      return;
    }
    setIsSaving(true);
    await onConfirm(selectedService.id, commission);
    setIsSaving(false);
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[680px] max-w-[92vw] p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">
            {selectedService ? 'Edit Service Commission' : 'Add Service Commission'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isSaving}>✕</button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <div className="text-gray-600 mb-1">Service</div>
            <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
              {selectedService?.serviceName || 'No service selected'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Commission %</div>
            <input 
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              placeholder="Enter Commission Percentage (0-100)" 
              value={commission} 
              onChange={(e) => setCommission(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="mt-8 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-5 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-400"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentServiceSettingsPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedGarageId, setSelectedGarageId] = useState(null);

  // Load garages with services on mount
  useEffect(() => {
    loadGarages();
  }, []);

  const loadGarages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllGaragesWithServices();
      
      console.log('API Response:', response);
      
      if (response.success && response.data?.garages) {
        console.log('Garages loaded:', response.data.garages.length);
        setGarages(response.data.garages);
      } else {
        throw new Error('Failed to load garages');
      }
    } catch (err) {
      console.error('Error loading garages:', err);
      setError(err.message || 'Failed to load garages');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCommission = (garageId, service) => {
    setSelectedGarageId(garageId);
    setSelectedService(service);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedService(null);
    setSelectedGarageId(null);
  };

  const handleConfirmCommission = async (serviceId, commissionPercentage) => {
    try {
      const percentage = parseFloat(commissionPercentage);
      
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        alert('Commission must be between 0 and 100');
        return;
      }

      const response = await setServiceCommission(serviceId, percentage);
      
      if (response.success) {
        // Update local state
        setGarages(prevGarages => 
          prevGarages.map(garage => {
            if (garage.garageId === selectedGarageId) {
              return {
                ...garage,
                services: garage.services.map(service => 
                  service.id === serviceId
                    ? {
                        ...service,
                        commission: `${percentage}%`,
                        commissionPercentage: percentage,
                      }
                    : service
                ),
              };
            }
            return garage;
          })
        );
        handleCloseModal();
      } else {
        throw new Error(response.message || 'Failed to set commission');
      }
    } catch (err) {
      console.error('Error setting commission:', err);
      alert(err.message || 'Failed to set commission');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Content, Notification & CMS Controls</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-600">Loading garages and services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Content, Notification & CMS Controls</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={loadGarages}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Content, Notification & CMS Controls</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5 pb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Setting</h2>
          
          {garages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No Garages with Services Found</p>
              <p className="text-sm">Garages need to add services in their Service Management page first.</p>
              <p className="text-sm mt-2">Once garages add services, they will appear here for commission management.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {garages.map((garage) => (
                <div key={garage.garageId} className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                      <div className="text-gray-800 font-semibold">{garage.garageName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {garage.email}
                        {garage.phoneNumber && ` • ${garage.phoneNumber}`}
                        {garage.location && ` • ${garage.location}`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {garage.serviceCount} service{garage.serviceCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {garage.services.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No services available for this garage
                    </div>
                  ) : (
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
                          {garage.services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 text-sm text-gray-800">{service.serviceName}</td>
                              <td className="px-5 py-3 text-sm text-gray-800">{service.basePrice}</td>
                              <td className="px-5 py-3 text-sm text-gray-800">{service.duration}</td>
                              <td className="px-5 py-3 text-sm text-gray-800">{service.bookings}</td>
                              <td className="px-5 py-3 text-sm text-gray-800">
                                <Badge>{service.status}</Badge>
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-800 font-medium">
                                {service.commission}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button 
                                  onClick={() => handleEditCommission(garage.garageId, service)}
                                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                                  title="Edit commission"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal 
        open={open} 
        onClose={handleCloseModal} 
        onConfirm={handleConfirmCommission}
        selectedService={selectedService}
      />
    </div>
  );
};

export default ContentServiceSettingsPage;
