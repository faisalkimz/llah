import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Organizations() {
  const { api } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const result = await api('/organizations');
      
      if (result.success) {
        setOrganizations(result.data);
        setError(null);
        
        // Set first organization as current if none is set
        if (result.data.length > 0 && !localStorage.getItem('current_organization_id')) {
          localStorage.setItem('current_organization_id', result.data[0].id);
        }
      } else {
        setError(result.error?.message || 'Failed to load organizations');
      }
    } catch (err) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }

  function selectOrganization(orgId) {
    localStorage.setItem('current_organization_id', orgId);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <Link
          to="/organizations/new"
          className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
        >
          Create Organization
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No organizations yet</p>
          <Link
            to="/organizations/new"
            className="text-sm text-black hover:underline"
          >
            Create your first organization
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              to={`/organizations/${org.id}`}
              onClick={() => selectOrganization(org.id)}
              className="block p-4 bg-white border border-gray-200 rounded hover:border-gray-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">/{org.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {org.role}
                  </span>
                  {org.memberCount && (
                    <span className="text-sm text-gray-500">
                      {org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
