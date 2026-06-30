import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchEvents } from '../api/events';
import type { Event } from '../api/events';
import { fetchClubs } from '../api/clubs';
import type { Club } from '../api/clubs';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const EventListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState(searchParams.get('club') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsData, clubsData] = await Promise.all([fetchEvents(), fetchClubs()]);
        setEvents(eventsData);
        setClubs(clubsData);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sync club filter with URL param
  useEffect(() => {
    const clubParam = searchParams.get('club');
    if (clubParam) setSelectedClub(clubParam);
  }, [searchParams]);

  const handleClubChange = (clubId: string) => {
    setSelectedClub(clubId);
    if (clubId) {
      setSearchParams({ club: clubId });
    } else {
      setSearchParams({});
    }
  };

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesClub = !selectedClub || e.club_id?._id === selectedClub;
      const matchesSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const eventDate = new Date(e.date);
      const matchesFrom = !dateFrom || eventDate >= new Date(dateFrom);
      const matchesTo = !dateTo || eventDate <= new Date(dateTo);
      return matchesClub && matchesSearch && matchesFrom && matchesTo;
    });
  }, [events, selectedClub, search, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-accent-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">All Events</h1>
          <p className="text-primary-100">Discover events from all PICT clubs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            />
          </div>

          {/* Club filter */}
          <select
            value={selectedClub}
            onChange={(e) => handleClubChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <option value="">All Clubs</option>
            {clubs.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            aria-label="From date"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            aria-label="To date"
          />

          {/* Clear filters */}
          {(search || selectedClub || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedClub('');
                setDateFrom('');
                setDateTo('');
                setSearchParams({});
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-all duration-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventListPage;
