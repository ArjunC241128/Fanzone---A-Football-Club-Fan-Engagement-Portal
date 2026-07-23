import React from 'react';
import { useLoaderData } from 'react-router';

const UpdateNews = () => {
    const post = useLoaderData()
    const { _id, title, category, image, content } = post

    const handleUpdateNews = (e) => {
        e.preventDefault()
        const title = e.target.title.value
        const category = e.target.category.value
        const image = e.target.image.value
        const content = e.target.content.value
        const updatedNews = { title, category, image, content }

        fetch(`http://localhost:3000/news/${_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNews),
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    alert("News Post Updated Successfully")
                    console.log(data)
                }
            })
    }

    return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
            <form
                onSubmit={handleUpdateNews}
                className="w-full max-w-lg rounded-lg border border-white/10 bg-[#141B2D] p-6"
            >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2F9E44]">Titans Fanzone</p>
                <h1 className="text-xl font-black uppercase tracking-tight text-[#EDEFF5] mb-6">
                    Update News Post
                </h1>

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Title</label>
                <input
                    name="title"
                    defaultValue={title}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Category</label>
                <input
                    name="category"
                    defaultValue={category}
                    placeholder="Match Preview / Recap / Announcement"
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Image URL</label>
                <input
                    name="image"
                    defaultValue={image}
                    className="w-full mb-4 rounded bg-[#0B1220] border border-white/10 px-3 py-2 text-sm text-[#EDEFF5] focus:outline-none focus:border-[#2F9E44]"
                />

                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B93A7] mb-1">Content</label>
                <textarea
                    name="content"
                    defaultValue={content}
                    rows={5}
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

export default UpdateNews;