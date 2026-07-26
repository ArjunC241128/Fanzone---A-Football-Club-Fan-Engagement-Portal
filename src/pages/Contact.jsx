import { useState } from 'react';

const reasons = ["Membership", "Tickets", "Academy", "Media", "Other"];

const Contact = () => {

    const [reason, setReason] = useState("Membership")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState("idle") 
    const [copied, setCopied] = useState(false)

    const maxLength = 500 

    const validate = (name, email, message) => {
        const newErrors = {}
        if (!name.trim()) newErrors.name = "Please tell us your name"
        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!email.includes("@")) {
            newErrors.email = "That doesn't look like a valid email"
        }
        if (!message.trim()) newErrors.message = "Message can't be empty"
        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const name = e.target.name.value
        const email = e.target.email.value
        const messageValue = e.target.message.value

        const foundErrors = validate(name, email, messageValue)
        setErrors(foundErrors)

        if (Object.keys(foundErrors).length > 0) return

        setStatus("sending")

        // simulated request, swap for a real fetch() call once a backend exists
        setTimeout(() => {
            console.log({ reason, name, email, message: messageValue })
            setStatus("sent")
            e.target.reset()
            setMessage("")
        }, 1200)
    }

    const copyEmail = () => {
        navigator.clipboard.writeText("hello@chattogramtitans.fc")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div>
            {/* Header band, matches About page style */}
            <section className="bg-(--color-pitch) py-12 sm:py-16 md:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-gold)">
                        Get in touch
                    </span>
                    <h1 className="font-(family-name:--font-display) text-(--color-line) text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 leading-tight">
                        TALK TO
                        <br />
                        THE TITANS
                    </h1>
                    <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-(--color-line)/70 leading-relaxed">
                        Questions about matchday, memberships, or the academy? The club office
                        is always ready to hear from the fans who make Titans Arena roar.
                    </p>
                </div>
            </section>

            <section className="bg-(--color-concrete)">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 gap-8 sm:gap-10 md:gap-12 lg:grid-cols-5">

                    {/* Contact info, scoreboard style cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 lg:gap-6">

                        <div className="rounded-md bg-(--color-pitch) p-5 sm:p-6 md:p-8 transition-transform hover:-translate-y-1">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-gold)">
                                Club office
                            </span>
                            <p className="mt-3 text-sm sm:text-base text-(--color-line)/80 leading-relaxed">
                                Titans Arena<br />
                                Agrabad, Chattogram<br />
                                Bangladesh
                            </p>
                        </div>

                        <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-5 sm:p-6 md:p-8 transition-transform hover:-translate-y-1">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
                                Phone
                            </span>
                            <p className="mt-2 scoreboard-digits text-(--color-pitch) text-base sm:text-lg">
                                +880 31 000 000
                            </p>
                        </div>

                        <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-5 sm:p-6 md:p-8 transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
                                    Email
                                </span>
                                <button
                                    type="button"
                                    onClick={copyEmail}
                                    className="text-[11px] font-semibold uppercase tracking-wide text-(--color-pitch)/60 hover:text-(--color-kit) transition-colors"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <p className="mt-2 text-sm sm:text-base text-(--color-pitch) font-semibold break-words">
                                hello@chattogramtitans.fc
                            </p>
                        </div>

                        <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-5 sm:p-6 md:p-8 transition-transform hover:-translate-y-1">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
                                Office hours
                            </span>
                            <p className="mt-2 text-sm sm:text-base text-(--color-ink)/80 leading-relaxed">
                                Saturday to Thursday, 10am to 6pm.<br />
                                Closed on matchdays and Fridays.
                            </p>
                        </div>
                    </div>

                    {/* Contact form */}
                    <div className="lg:col-span-3">
                        <div className="rounded-md bg-(--color-line) border border-(--color-ink)/10 p-5 sm:p-8 md:p-10">
                            <h2 className="font-(family-name:--font-display) text-xl sm:text-2xl md:text-3xl text-(--color-pitch) mb-2">
                                Send a message
                            </h2>
                            <p className="text-sm text-(--color-ink)/60 mb-6 sm:mb-8">
                                Pick a topic below and the right team will get your message.
                            </p>

                            {/* Reason chips */}
                            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                                {reasons.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setReason(r)}
                                        className={`rounded-full px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide transition-colors ${
                                            reason === r
                                                ? "bg-(--color-kit) text-(--color-line)"
                                                : "bg-(--color-concrete) text-(--color-ink)/60 hover:bg-(--color-ink)/10"
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            {status === "sent" && (
                                <div className="mb-6 rounded-sm bg-(--color-pitch) text-(--color-line) px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="text-(--color-gold)">✓</span>
                                    Message sent. The club office will reply soon.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-ink)/60 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your full name"
                                            className={`w-full rounded-sm border bg-(--color-canvas) px-4 py-3 text-sm text-(--color-ink) focus:outline-none transition-colors ${
                                                errors.name
                                                    ? "border-(--color-kit)"
                                                    : "border-(--color-ink)/15 focus:border-(--color-kit)"
                                            }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-xs text-(--color-kit)">{errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-ink)/60 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            className={`w-full rounded-sm border bg-(--color-canvas) px-4 py-3 text-sm text-(--color-ink) focus:outline-none transition-colors ${
                                                errors.email
                                                    ? "border-(--color-kit)"
                                                    : "border-(--color-ink)/15 focus:border-(--color-kit)"
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs text-(--color-kit)">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-(--color-ink)/60">
                                            Message
                                        </label>
                                        <span className="text-xs text-(--color-ink)/40 scoreboard-digits">
                                            {message.length}/{maxLength}
                                        </span>
                                    </div>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        maxLength={maxLength}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={`How can the club help with ${reason.toLowerCase()}?`}
                                        className={`w-full rounded-sm border bg-(--color-canvas) px-4 py-3 text-sm text-(--color-ink) focus:outline-none transition-colors resize-none ${
                                            errors.message
                                                ? "border-(--color-kit)"
                                                : "border-(--color-ink)/15 focus:border-(--color-kit)"
                                        }`}
                                    />
                                    {errors.message && (
                                        <p className="mt-1.5 text-xs text-(--color-kit)">{errors.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="w-full sm:w-auto rounded-sm bg-(--color-kit) hover:bg-(--color-kit-dark) disabled:opacity-60 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-(--color-line) transition-colors"
                                >
                                    {status === "sending" ? "Sending..." : "Send message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;