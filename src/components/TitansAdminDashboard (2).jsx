import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import MatchCard from './components/MatchCard';
import PlayerCard from './components/PlayerCard';
import NewsCard from './components/NewsCard';

const TABS = [
    { key: 'matches', label: 'Matches' },
    { key: 'players', label: 'Players' },
    { key: 'news', label: 'News' },
    { key: 'users', label: 'Users' },
];

const TitansAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('matches');

    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        Promise.all([
            fetch('http://localhost:3000/matches').then(res => res.json()),
            fetch('http://localhost:3000/players').then(res => res.json()),
            fetch('http://localhost:3000/news').then(res => res.json()),
            fetch('http://localhost:3000/users').then(res => res.json()),
        ])
            .then(([matchData, playerData, newsData, userData]) => {
                setMatches(matchData)
                setPlayers(playerData)
                setNewsList(newsData)
                setUsers(userData)
                setLoading(false)
            })
    }, [])

    const handlePromoteUser = (id) => {
        fetch(`http://localhost:3000/users/admin/${id}`, {
            method: 'PATCH',
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    setUsers(users.map(u => u._id === id ? { ...u, role: 'admin' } : u))
                }
            })
    }

    const addLinkByTab = {
        matches: '/addMatch',
        players: '/addPlayer',
        news: '/addNews',
    };

    return (
        <div className="min-h-screen bg-[#0B1220] text-[#EDEFF5]">

            {/* Scoreboard header */}
            <header className="border-b border-white/10 bg-[#141B2D]">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2F9E44]">
                            Titans Fanzone
                        </p>
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            Admin Control Room
                        </h1>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B93A7]">Matchday Feed</p>
                        <p className="text-sm font-bold text-[#EDEFF5]">
                            {matches.filter(m => m.isLive).length} Live &middot; {matches.length} Total
                        </p>
                    </div>
                </div>

                {/* Tab strip */}
                <nav className="max-w-6xl mx-auto px-6 flex gap-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-[#2F9E44] text-[#EDEFF5]'
                                    : 'border-transparent text-[#8B93A7] hover:text-[#EDEFF5]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">

                {activeTab !== 'users' && (
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-black uppercase tracking-tight text-[#EDEFF5]">
                            {TABS.find(t => t.key === activeTab).label}
                        </h2>
                        <Link
                            to={addLinkByTab[activeTab]}
                            className="text-xs font-black uppercase tracking-widest px-3 py-2 rounded bg-[#2F9E44] text-[#0B1220] hover:bg-[#4ADE72] transition-colors"
                        >
                            + New {activeTab === 'matches' ? 'Fixture' : activeTab === 'players' ? 'Player' : 'Post'}
                        </Link>
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-[#8B93A7]">Loading dashboard data...</p>
                ) : (
                    <>
                        {activeTab === 'matches' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {matches.map(match => (
                                    <MatchCard
                                        key={match._id}
                                        match={match}
                                        matches={matches}
                                        setMatches={setMatches}
                                    />
                                ))}
                                {matches.length === 0 && (
                                    <p className="text-sm text-[#8B93A7]">No fixtures on the board yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'players' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {players.map(player => (
                                    <PlayerCard
                                        key={player._id}
                                        player={player}
                                        players={players}
                                        setPlayers={setPlayers}
                                    />
                                ))}
                                {players.length === 0 && (
                                    <p className="text-sm text-[#8B93A7]">No players on the roster yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'news' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {newsList.map(post => (
                                    <NewsCard
                                        key={post._id}
                                        post={post}
                                        newsList={newsList}
                                        setNewsList={setNewsList}
                                    />
                                ))}
                                {newsList.length === 0 && (
                                    <p className="text-sm text-[#8B93A7]">No news posted yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="rounded-lg border border-white/10 bg-[#141B2D] overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-[#8B93A7] border-b border-white/10">
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="border-b border-white/5 last:border-0">
                                                <td className="px-4 py-3 font-bold">{u.name}</td>
                                                <td className="px-4 py-3 text-[#8B93A7]">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                        u.role === 'admin'
                                                            ? 'bg-[#2F9E44]/15 text-[#4ADE72] border-[#2F9E44]/40'
                                                            : 'bg-white/5 text-[#8B93A7] border-white/10'
                                                    }`}>
                                                        {u.role || 'fan'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handlePromoteUser(u._id)}
                                                            className="text-xs font-black uppercase tracking-widest text-[#F5C169] hover:text-[#F5A623]"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-4 text-[#8B93A7]">No registered users yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default TitansAdminDashboard;
