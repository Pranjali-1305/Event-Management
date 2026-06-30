import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api/events';
import type { Event } from '../api/events';
import { fetchAdminRegistrations } from '../api/registrations';
import type { Registration } from '../api/registrations';
import { fetchClubs, addTentativeDate, deleteTentativeDate } from '../api/clubs';
import type { Club, TentativeDate } from '../api/clubs';
import LoadingSpinner from '../components/LoadingSpinner';

interface EventFormData {
  title: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
}

const emptyForm: EventFormData = { title: '', date: '', location: '', description: '', image_url: '' };

const AdminDashboardPage = () => {
  const { token, adminClubId, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(emptyForm);
  const [eventFormError, setEventFormError] = useState('');
  const [eventFormLoading, setEventFormLoading] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tentative date form
  const [tentLabel, setTentLabel] = useState('');
  const [tentDate, setTentDate] = useState('');
  const [tentError, setTentError] = useState('');
  const [tentLoading, setTentLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'events' | 'registrations' | 'tentative'>('events');

  useEffect(() => {
    if (!token || !adminClubId) return;
    const load = async () => {
      try {
        const [allEvents, regs, clubs] = await Promise.all([
          fetchEvents(),
          fetchAdminRegistrations(token),
          fetchClubs(),
        ]);
        setEvents(allEvents.filter((e) => e.club_id?._id === adminClubId));
        setRegistrations(regs);
        const myClub = clubs.find((c) => c._id === adminClubId) || null;
        setClub(myClub);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, adminClubId]);

  // --- Event CRUD ---
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEventFormLoading(true);
    setEventFormError('');
    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent._id, eventForm, token);
        setEvents((prev) => prev.map((ev) => (ev._id === updated._id ? updated : ev)));
      } else {
        const created = await createEvent(eventForm, token);
        setEvents((prev) => [...prev, created]);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm(emptyForm);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEventFormError(msg || 'Failed to save event');
    } finally {
      setEventFormLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date.slice(0, 10),
      location: event.location,
      description: event.description,
      image_url: event.image_url || '',
    });
    setShowEventForm(true);
    setEventFormError('');
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteEvent(id, token);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Tentative dates ---
  const handleAddTentative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !adminClubId || !club) return;
    setTentLoading(true);
    setTentError('');
    try {
      const updated = await addTentativeDate(adminClubId, { label: tentLabel, date: tentDate }, token);
      setClub(updated);
      setTentLabel('');
      setTentDate('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTentError(msg || 'Failed to add tentative date');
    } finally {
      setTentLoading(false);
    }
  };

  const handleDeleteTentative = async (entryId: string) => {
    if (!token || !adminClubId) return;
    try {
      const updated = await deleteTentativeDate(adminClubId, entryId, token);
      setClub(updated);
    } catch (err) {
      console.error('Delete tentative error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-accent-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
            <p className="text-primary-100 mt-1">{club?.name || 'Your Club'}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-white/10 border border-white/30 rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{events.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Events</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">{registrations.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registrations</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-3xl font-extrabold text-accent-500">{club?.tentative_dates?.length || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tentative Dates</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {(['events', 'registrations', 'tentative'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'tentative' ? 'Tentative Dates' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Events</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm(emptyForm);
                  setEventFormError('');
                  setShowEventForm(true);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                + New Event
              </button>
            </div>

            {/* Event Form */}
            {showEventForm && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <form onSubmit={handleEventSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (optional)</label>
                    <input
                      type="url"
                      value={eventForm.image_url}
                      onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                    />
                  </div>

                  {eventFormError && (
                    <div className="sm:col-span-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                      {eventFormError}
                    </div>
                  )}

                  <div className="sm:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={eventFormLoading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors duration-200 flex items-center gap-2"
                    >
                      {eventFormLoading && <LoadingSpinner size="sm" />}
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Events list */}
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No events yet. Create your first event!
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>📍 {event.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      {deletingId === event._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(event._id)}
                          className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Registrations</h2>
            {registrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No registrations yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Event</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {registrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{reg.name}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{reg.email}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{reg.event_id?.title}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {reg.event_id?.date
                              ? new Date(reg.event_id.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tentative Dates Tab */}
        {activeTab === 'tentative' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tentative Dates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Add placeholder dates for upcoming events. These will be shown on the home page when your club has no confirmed events.
            </p>

            {/* Add form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Add Tentative Date</h3>
              <form onSubmit={handleAddTentative} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Event label (e.g. Annual Fest)"
                  value={tentLabel}
                  onChange={(e) => setTentLabel(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                />
                <input
                  type="date"
                  required
                  value={tentDate}
                  onChange={(e) => setTentDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={tentLoading}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  {tentLoading && <LoadingSpinner size="sm" />}
                  Add Date
                </button>
              </form>
              {tentError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{tentError}</p>
              )}
            </div>

            {/* List */}
            {!club?.tentative_dates || club.tentative_dates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tentative dates added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {club.tentative_dates.map((entry: TentativeDate) => (
                  <div
                    key={entry._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{entry.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ~{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTentative(entry._id)}
                      className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
