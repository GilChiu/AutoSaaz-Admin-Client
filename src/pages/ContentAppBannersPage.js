import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Image, Eye, EyeOff, ExternalLink } from 'lucide-react';
import appBannersService from '../services/appBanners.service';

const ContentAppBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    action_type: 'internal',
    action_url: '',
    target_platform: 'both',
    position: 0,
    background_color: '#FF6B35',
    text_color: '#FFFFFF',
    start_date: '',
    end_date: '',
  });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (activeFilter !== 'all') filters.is_active = activeFilter === 'active';
      if (platformFilter !== 'all') filters.target_platform = platformFilter;
      
      const response = await appBannersService.getBanners(filters);
      setBanners(response.data || []);
    } catch (err) {

      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, platformFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await appBannersService.updateBanner(editingBanner.id, formData);
      } else {
        await appBannersService.createBanner(formData);
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await appBannersService.toggleBannerStatus(banner.id, !banner.is_active);
      fetchBanners();
    } catch (err) {
      alert(err.message || 'Failed to toggle banner status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    try {
      await appBannersService.deleteBanner(id);
      fetchBanners();
    } catch (err) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      action_type: banner.action_type,
      action_url: banner.action_url || '',
      target_platform: banner.target_platform,
      position: banner.position,
      background_color: banner.background_color || '#FF6B35',
      text_color: banner.text_color || '#FFFFFF',
      start_date: banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 10) : '',
      end_date: banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      action_type: 'internal',
      action_url: '',
      target_platform: 'both',
      position: 0,
      background_color: '#FF6B35',
      text_color: '#FFFFFF',
      start_date: '',
      end_date: '',
    });
    setEditingBanner(null);
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPlatformBadge = (platform) => {
    const styles = {
      both: 'bg-purple-100 text-purple-700',
      mobile: 'bg-blue-100 text-blue-700',
      garage: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[platform] || styles.both}`}>
        {platform}
      </span>
    );
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">App Banners</h2>
          <p className="text-sm text-gray-600 mt-1">Manage in-app banners and promotional content</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Create Banner
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={fetchBanners} className="text-red-600 underline mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Platforms</option>
            <option value="both">Both</option>
            <option value="mobile">Mobile</option>
            <option value="garage">Garage</option>
          </select>

          <button
            onClick={fetchBanners}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Image size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No banners found</p>
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Banner Preview */}
              <div
                className="h-40 relative"
                style={{
                  backgroundColor: banner.background_color || '#FF6B35',
                  backgroundImage: banner.image_url ? `url(${banner.image_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!banner.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image size={48} className="text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {banner.is_active ? (
                    <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">Active</span>
                  ) : (
                    <span className="bg-gray-500 text-white px-2 py-1 text-xs rounded">Inactive</span>
                  )}
                  {getPlatformBadge(banner.target_platform)}
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{banner.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Position:</span>
                    <span>{banner.position}</span>
                  </div>
                  {banner.action_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink size={14} />
                      <span className="truncate">{banner.action_url}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Views:</span>
                    <span>{banner.view_count || 0}</span>
                    <span className="ml-2 font-medium">Clicks:</span>
                    <span>{banner.click_count || 0}</span>
                  </div>
                  {banner.start_date && (
                    <div className="text-xs">
                      {new Date(banner.start_date).toLocaleDateString()} -{' '}
                      {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'No end'}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                      banner.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {banner.is_active ? (
                      <>
                        <EyeOff size={16} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        Activate
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter banner description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={formData.action_type}
                      onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="none">None</option>
                      <option value="internal">Internal Link</option>
                      <option value="external">External Link</option>
                      <option value="deep_link">Deep Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Platform
                    </label>
                    <select
                      value={formData.target_platform}
                      onChange={(e) => setFormData({ ...formData, target_platform: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="both">Both</option>
                      <option value="mobile">Mobile App</option>
                      <option value="garage">Garage App</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action URL
                  </label>
                  <input
                    type="text"
                    value={formData.action_url}
                    onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="/services or https://example.com"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingBanner ? 'Update' : 'Create'} Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAppBannersPage;
