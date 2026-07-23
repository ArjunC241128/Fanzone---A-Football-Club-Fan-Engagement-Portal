import React from 'react';
import { useLoaderData } from 'react-router';

const UpdateMatch = () => {
    const match = useLoaderData()
    const { _id, opponent, venue, competition, date, score, isLive } = match

    const handleUpdateMatch = (e) => {
        e.preventDefault()
        const opponent = e.target.opponent.value
        const venue = e.target.venue.value
        const competition = e.target.competition.value
        const date = e.target.date.value
        const score = e.target.score.value
        const isLive = e.target.isLive.checked
        const updatedMatch = { opponent, venue, competition, date, score, isLive }

        fetch(`http://localhost:3000/matches/${_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMatch),
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    alert("Match Updated Successfully")
                    console.log(data)
                }
            })
    }

    return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
            <form
                onSubmit={handleUpdateMatch}
                className="w-full max-w-lg rounded-lg border border-white/10 bg-[#141B2D] p-6"
            >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2F9E44]">Titans Fanzone</p>
                <h1 className="text-xl font-black uppercase tracking-tight text-[#EDEFF5] mb-6">
                    Update Fixture
                </h1>

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Opponent</label>
                <input
                    name="opponent"
                    defaultValue={opponent}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Venue</label>
                <input
                    name="venue"
                    defaultValue={venue}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Competition</label>
                <input
                    name="competition"
                    defaultValue={competition}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Date</label>
                        <input
                            name="date"
                            defaultValue={date}
                            className="w-full rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Score</label>
                        <input
                            name="score"
                            defaultValue={score}
                            placeholder="e.g. 2 - 1"
                            className="w-full rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                        />
                    </div>
                </div>

                <label className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-[#8B93A7]">
                    <input
                        type="checkbox"
                        name="isLive"
                        defaultChecked={isLive}
                        className="h-4 w-4 accent-[#2F9E44]"
                    />
                    Mark as Live
                </label>

                <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-[#2F9E44] text-[#0B1220] text-xs font-black uppercase tracking-widest hover:bg-[#4ADE72] transition-colors"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default UpdateMatch;
