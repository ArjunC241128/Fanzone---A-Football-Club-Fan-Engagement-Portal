import React from 'react';
import { Link } from 'react-router';

const statusStyles = {
    live: 'bg-[#2F9E44]/15 text-[#4ADE72] border-[#2F9E44]/40',
    upcoming: 'bg-[#F5A623]/15 text-[#F5C169] border-[#F5A623]/40',
    ft: 'bg-white/5 text-[#8B93A7] border-white/10',
};

const MatchCard = ({ match, matches, setMatches }) => {
    const { _id, opponent, venue, competition, date, score, isLive } = match;

    const statusKey = isLive ? 'live' : (score ? 'ft' : 'upcoming');
    const statusLabel = isLive ? 'LIVE' : (score ? 'FT' : 'UPCOMING');

    const handleDeleteMatch = (id) => {
        fetch(`http://localhost:3000/matches/${_id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.deletedCount) {
                    const remaining = matches.filter(m => m._id !== id)
                    setMatches(remaining)
                }
            })
    }

    return (
        <div className="rounded-lg border border-white/10 bg-[#141B2D] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.03]">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#8B93A7]">
                    {competition || 'Friendly'}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${statusStyles[statusKey]}`}>
                    {statusLabel}
                </span>
            </div>

            <div className="px-4 py-5 text-center">
                <p className="text-2xl font-black uppercase tracking-tight text-[#EDEFF5]">
                    Titans <span className="text-[#8B93A7] mx-1">vs</span> {opponent}
                </p>
                {score ? (
                    <p className="mt-2 text-4xl font-black tabular-nums text-[#EDEFF5]">{score}</p>
                ) : (
                    <p className="mt-2 text-sm text-[#8B93A7]">{date}</p>
                )}
                <p className="mt-1 text-xs text-[#8B93A7]">{venue}</p>
            </div>

            <div className="flex divide-x divide-white/10 border-t border-white/10 text-xs font-bold uppercase tracking-wide">
                <Link
                    to={`/matches/${_id}`}
                    className="flex-1 text-center py-2.5 text-[#8B93A7] hover:text-[#EDEFF5] hover:bg-white/5 transition-colors"
                >
                    Details
                </Link>
                <Link
                    to={`/updateMatch/${_id}`}
                    className="flex-1 text-center py-2.5 text-[#F5C169] hover:bg-white/5 transition-colors"
                >
                    Update
                </Link>
                <button
                    onClick={() => handleDeleteMatch(_id)}
                    className="flex-1 text-center py-2.5 text-[#F27272] hover:bg-white/5 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default MatchCard;
