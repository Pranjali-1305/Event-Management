import { useNavigate } from 'react-router-dom';
import type { Club } from '../api/clubs';
import type { Event } from '../api/events';

interface LogoCarouselProps {
  clubs: Club[];
  events: Event[];
}

const LogoCarousel = ({ clubs, events }: LogoCarouselProps) => {
  const navigate = useNavigate();
  const now = new Date();

  const getClubBadge = (club: Club) => {
    const hasUpcoming = events.some(
      (e) => e.club_id?._id === club._id && new Date(e.date) >= now
    );
    if (hasUpcoming) return 'active';
    if (club.tentative_dates && club.tentative_dates.length > 0) return 'tentative';
    return null;
  };

  const getEarliestTentative = (club: Club) => {
    if (!club.tentative_dates || club.tentative_dates.length === 0) return null;
    return club.tentative_dates.reduce((earliest, curr) =>
      new Date(curr.date) < new Date(earliest.date) ? curr : earliest
    );
  };

  // Duplicate clubs for seamless infinite scroll
  const doubled = [...clubs, ...clubs];

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-8 animate-scroll"
        style={{ width: 'max-content' }}
      >
        {doubled.map((club, idx) => {
          const badge = getClubBadge(club);
          const tentative = badge === 'tentative' ? getEarliestTentative(club) : null;

          return (
            <div
              key={`${club._id}-${idx}`}
              className="relative flex flex-col items-center cursor-pointer group flex-shrink-0"
              onClick={() => navigate(`/events?club=${club._id}`)}
              role="button"
              tabIndex={0}
              aria-label={`View ${club.name} events`}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/events?club=${club._id}`)}
            >
              {/* Badge */}
              {badge === 'active' && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white animate-pulse-glow shadow-lg">
                  Events On!
                </span>
              )}
              {badge === 'tentative' && tentative && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  ~{new Date(tentative.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              )}

              {/* Logo circle */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300 bg-white dark:bg-gray-800">
                <img
                  src={club.logo_url}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Club name */}
              <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 text-center max-w-[90px] leading-tight group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200">
                {club.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogoCarousel;
