import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchClubs } from '../api/clubs';
import type { Club } from '../api/clubs';
import { fetchEvents } from '../api/events';
import type { Event } from '../api/events';
import LogoCarousel from '../components/LogoCarousel';
import LoadingSpinner from '../components/LoadingSpinner';
import EventCard from '../components/EventCard';

const HomePage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [clubsData, eventsData] = await Promise.all([fetchClubs(), fetchEvents()]);
        setClubs(clubsData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in">
            PICT Events Hub
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Discover and register for events from all PICT clubs in one place
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link
              to="/events"
              className="px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Browse All Events
            </Link>
            <Link
              to="/admin/login"
              className="px-8 py-3 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Club Carousel Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            PICT Clubs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Click a club to see their events
          </p>
          {loading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : (
            <LogoCarousel clubs={clubs} events={events} />
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Upcoming Events
            </h2>
            <Link
              to="/events"
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline transition-colors duration-200"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No upcoming events at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold">{clubs.length}+</div>
            <div className="text-primary-100 mt-1">Active Clubs</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold">{events.length}+</div>
            <div className="text-primary-100 mt-1">Events</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-4xl font-extrabold">∞</div>
            <div className="text-primary-100 mt-1">Opportunities</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
