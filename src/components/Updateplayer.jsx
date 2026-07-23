import React from 'react';
import { useLoaderData } from 'react-router';

const UpdatePlayer = () => {
    const player = useLoaderData()
    const { _id, name, position, jerseyNumber, image, stats } = player

    const handleUpdatePlayer = (e) => {
        e.preventDefault()
        const name = e.target.name.value
        const position = e.target.position.value
        const jerseyNumber = e.target.jerseyNumber.value
        const image = e.target.image.value
        const stats = e.target.stats.value
        const updatedPlayer = { name, position, jerseyNumber, image, stats }

        fetch(`http://localhost:3000/players/${_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPlayer),
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    alert("Player Updated Successfully")
                    console.log(data)
                }
            })
    }

    return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
            <form
                onSubmit={handleUpdatePlayer}
                className="w-full max-w-lg rounded-lg border border-white/10 bg-[#141B2D] p-6"
            >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2F9E44]">Titans Fanzone</p>
                <h1 className="text-xl font-black uppercase tracking-tight text-[#EDEFF5] mb-6">
                    Update Player
                </h1>

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Name</label>
                <input
                    name="name"
                    defaultValue={name}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Position</label>
                        <input
                            name="position"
                            defaultValue={position}
                            className="w-full rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Jersey #</label>
                        <input
                            name="jerseyNumber"
                            defaultValue={jerseyNumber}
                            className="w-full rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                        />
                    </div>
                </div>

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Photo URL</label>
                <input
                    name="image"
                    defaultValue={image}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Stats</label>
                <textarea
                    name="stats"
                    defaultValue={stats}
                    rows={3}
                    className="w-full mb-6 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

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

export default UpdatePlayer;