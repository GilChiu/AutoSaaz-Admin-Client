import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Eye, EyeOff, Globe, Calendar } from 'lucide-react';
import cmsPoliciesService from '../services/cmsPolicies.service';

const ContentCMSPoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    policy_type: 'privacy_policy',
    language: 'en',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, [typeFilter, publishedFilter, languageFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (typeFilter !== 'all') filters.policy_type = typeFilter;
      if (publishedFilter !== 'all') filters.is_published = publishedFilter === 'published';
      if (languageFilter !== 'all') filters.language = languageFilter;
      
      const response = await cmsPoliciesService.getPolicies(filters);
      setPolicies(response.data || []);
    } catch (err) {
      console.error('Failed to load policies:', err);
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await cmsPoliciesService.updatePolicy(editingPolicy.id, formData);
      } else {
        await cmsPoliciesService.createPolicy(formData);
      }
      setShowModal(false);
      resetForm();
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleTogglePublish = async (policy) => {
    try {
      await cmsPoliciesService.togglePublish(policy.id, !policy.is_published);
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }
    try {
      await cmsPoliciesService.deletePolicy(id);
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Failed to delete policy');
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      content: policy.content,
      policy_type: policy.policy_type,
      language: policy.language,
      meta_title: policy.meta_title || '',
      meta_description: policy.meta_description || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      policy_type: 'privacy_policy',
      language: 'en',
      meta_title: '',
      meta_description: '',
    });
    setEditingPolicy(null);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type) => {
    const styles = {
      privacy_policy: 'bg-blue-100 text-blue-700',
      terms_of_service: 'bg-purple-100 text-purple-700',
      about_us: 'bg-green-100 text-green-700',
      help_center: 'bg-orange-100 text-orange-700',
      faq: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service',
      about_us: 'About Us',
      help_center: 'Help Center',
      faq: 'FAQ',
      other: 'Other',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[type] || styles.other}`}>
        {labels[type] || type}
      </span>
    );
  };

  const getLanguageBadge = (lang) => {
    const flags = {
      en: '🇺🇸',
      ar: '🇸🇦',
    };
    return (
      <span className="flex items-center gap-1 text-sm">
        <span>{flags[lang] || '🌐'}</span>
        <span>{lang.toUpperCase()}</span>
      </span>
    );
  };

  if (loading && policies.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">CMS & Policies</h2>
          <p className="text-sm text-gray-600 mt-1">Manage content pages, policies, and legal documents</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Create Policy
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={fetchPolicies} className="text-red-600 underline mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="privacy_policy">Privacy Policy</option>
            <option value="terms_of_service">Terms of Service</option>
            <option value="about_us">About Us</option>
            <option value="help_center">Help Center</option>
            <option value="faq">FAQ</option>
            <option value="other">Other</option>
          </select>

          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Languages</option>
            <option value="en">🇺🇸 English</option>
            <option value="ar">🇸🇦 Arabic</option>
          </select>

          <button
            onClick={fetchPolicies}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No policies found</p>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{policy.title}</p>
                        <p className="text-xs text-gray-500 mt-1">/{policy.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(policy.policy_type)}
                    </td>
                    <td className="px-6 py-4">
                      {getLanguageBadge(policy.language)}
                    </td>
                    <td className="px-6 py-4">
                      {policy.is_published ? (
                        <span className="flex items-center gap-1 text-green-700">
                          <Eye size={16} />
                          <span className="text-sm">Published</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-600">
                          <EyeOff size={16} />
                          <span className="text-sm">Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">v{policy.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Globe size={12} />
                          {policy.view_count || 0} views
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(policy.updated_at).toLocaleDateString()}
                        </div>
                        {policy.published_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Published: {new Date(policy.published_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(policy)}
                          className={`p-2 rounded ${
                            policy.is_published
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={policy.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {policy.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(policy)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="Enter policy title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Type *
                    </label>
                    <select
                      required
                      value={formData.policy_type}
                      onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="privacy_policy">Privacy Policy</option>
                      <option value="terms_of_service">Terms of Service</option>
                      <option value="about_us">About Us</option>
                      <option value="help_center">Help Center</option>
                      <option value="faq">FAQ</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="ar">🇸🇦 Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    placeholder="Enter policy content (supports HTML/Markdown)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports HTML tags and Markdown formatting
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">SEO Settings (Optional)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="SEO title for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="SEO description for search engines"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
                    {editingPolicy ? 'Update' : 'Create'} Policy
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

export default ContentCMSPoliciesPage;
