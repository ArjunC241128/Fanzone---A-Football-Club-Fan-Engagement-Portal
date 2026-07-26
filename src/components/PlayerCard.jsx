import React from 'react';
import { Link } from 'react-router';

const PlayerCard = ({ player, players, setPlayers }) => {
    const { _id, name, position, jerseyNumber, image, stats } = player;

    const handleDeletePlayer = (id) => {
        fetch(`https://fanzone-backend-anfn.onrender.com/players/${_id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.deletedCount) {
                    const remaining = players.filter(p => p._id !== id)
                    setPlayers(remaining)
                }
            })
    }

    return (
        <div className="relative rounded-lg border border-white/10 bg-[#141B2D] overflow-hidden">
            <span className="absolute top-3 right-3 text-4xl font-black text-white/10 leading-none select-none">
                {jerseyNumber}
            </span>

            <figure className="h-40 bg-white/5 flex items-center justify-center overflow-hidden">
                {image
                    ? <img src={image} alt={name} className="h-full w-full object-cover" />
                    : <span className="text-[#8B93A7] text-xs uppercase tracking-widest">No Photo</span>
                }
            </figure>

            <div className="px-4 py-4">
                <p className="text-lg font-black uppercase tracking-tight text-[#EDEFF5]">{name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2F9E44]">{position}</p>
                {stats && <p className="mt-2 text-xs text-[#8B93A7]">{stats}</p>}
            </div>

            <div className="flex divide-x divide-white/10 border-t border-white/10 text-xs font-bold uppercase tracking-wide">
                <Link
                    to={`/players/${_id}`}
                    className="flex-1 text-center py-2.5 text-[#8B93A7] hover:text-[#EDEFF5] hover:bg-white/5 transition-colors"
                >
                    Profile
                </Link>
                <Link
                    to={`/updatePlayer/${_id}`}
                    className="flex-1 text-center py-2.5 text-[#F5C169] hover:bg-white/5 transition-colors"
                >
                    Update
                </Link>
                <button
                    onClick={() => handleDeletePlayer(_id)}
                    className="flex-1 text-center py-2.5 text-[#F27272] hover:bg-white/5 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default PlayerCard;
