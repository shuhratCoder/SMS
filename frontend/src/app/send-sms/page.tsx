"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Send, Check, Search, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

interface SendSmsForm {
  message: string;
}

const MAX_CHARS = 160;

interface Recipient {
  id: string;
  type: "group" | "contact";
  label: string;
  count: number;
}

export default function SendSmsPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SendSmsForm>();

  const [groups, setGroups] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.getGroups(), api.getContacts()])
      .then(([g, c]) => { setGroups(g); setContacts(c) })
      .catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const messageValue = watch("message") || "";
  const charCount = messageValue.length;
  const smsCount = Math.ceil(charCount / MAX_CHARS) || 0;

  const selectedGroupIds = selectedRecipients
    .filter((r) => r.type === "group")
    .map((r) => r.id.replace("group-", ""));

  const excludedContactIds = new Set<string>();
  for (const g of groups) {
    if (selectedGroupIds.includes(String(g.id))) {
      for (const c of g.contacts || g.Contacts || []) {
        excludedContactIds.add(String(c.id));
      }
    }
  }

  const allRecipients: Recipient[] = [
    ...groups.map((g) => ({
      id: `group-${g.id}`,
      type: "group" as const,
      label: g.groupName,
      count: (g.contacts || g.Contacts || []).length,
    })),
    ...contacts
      .filter((c) => !excludedContactIds.has(String(c.id)))
      .map((c) => ({
        id: `contact-${c.id}`,
        type: "contact" as const,
        label: c.fullName,
        count: 1,
      })),
  ];

  const filteredRecipients = allRecipients.filter(
    (r) =>
      r.label.toLowerCase().includes(dropdownSearch.toLowerCase()) &&
      !selectedRecipients.some((s) => s.id === r.id)
  );

  const filteredGroups = filteredRecipients.filter((r) => r.type === "group");
  const filteredContacts = filteredRecipients.filter((r) => r.type === "contact");

  const addRecipient = (r: Recipient) => {
    setSelectedRecipients((prev) => {
      const next = [...prev, r];
      if (r.type === "group") {
        const group = groups.find((g) => `group-${g.id}` === r.id);
        const memberIds = new Set<string>(
          ((group?.contacts || group?.Contacts || []) as any[]).map((c) => `contact-${c.id}`)
        );
        return next.filter((x) => !(x.type === "contact" && memberIds.has(x.id)));
      }
      return next;
    });
    setDropdownSearch("");
  };

  const removeRecipient = (id: string) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const totalRecipientCount = selectedRecipients.reduce((sum, r) => sum + r.count, 0);

  const onSubmit = async (data: SendSmsForm) => {
    if (selectedRecipients.length === 0) return;
    try {
      setIsSending(true);
      const contactIds = selectedRecipients
        .filter((r) => r.type === "contact")
        .map((r) => r.id.replace("contact-", ""));
      const groupIds = selectedRecipients
        .filter((r) => r.type === "group")
        .map((r) => r.id.replace("group-", ""));

      await api.sendSMS({ message: data.message, contactIds, groupIds });

      setIsSending(false);
      setSent(true);
      setSelectedRecipients([]);
      reset();
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error(error);
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white font-display"
      >
        Send SMS
      </motion.h1>

      <GlassCard className="max-w-3xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Compose Message</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Multi-select recipients */}
            <div ref={dropdownRef}>
              <label className="block text-sm text-white/70 mb-2">
                Recipients
                {selectedRecipients.length > 0 && (
                  <span className="ml-2 text-xs text-purple-300">
                    ({totalRecipientCount} recipient{totalRecipientCount !== 1 ? "s" : ""})
                  </span>
                )}
              </label>

              {/* Selected tags */}
              <div
                className="min-h-[48px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-purple-500/40 focus-within:bg-white/[0.07] transition-all flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => setShowDropdown(true)}
              >
                {selectedRecipients.map((r) => (
                  <span
                    key={r.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      r.type === "group"
                        ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                        : "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                    }`}
                  >
                    {r.type === "group" ? "📁" : "👤"} {r.label}
                    {r.type === "group" && (
                      <span className="text-white/40">({r.count})</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecipient(r.id);
                      }}
                      className="ml-0.5 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex-1 min-w-[120px] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => {
                      setDropdownSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={selectedRecipients.length === 0 ? "Search groups or contacts..." : "Add more..."}
                    className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
                  />
                </div>
              </div>

              {/* Dropdown */}
              {showDropdown && (filteredGroups.length > 0 || filteredContacts.length > 0) && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-glass-lg">
                  {filteredGroups.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1 text-xs text-white/40 font-medium">Groups</div>
                      {filteredGroups.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => addRecipient(r)}
                          className="px-3 py-2.5 mx-1 rounded-lg cursor-pointer hover:bg-white/[0.06] transition-colors flex items-center justify-between"
                        >
                          <span className="text-sm text-white/80">📁 {r.label}</span>
                          <span className="text-xs text-white/40">{r.count} members</span>
                        </div>
                      ))}
                    </>
                  )}

                  {filteredContacts.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1 text-xs text-white/40 font-medium">Contacts</div>
                      {filteredContacts.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => addRecipient(r)}
                          className="px-3 py-2.5 mx-1 rounded-lg cursor-pointer hover:bg-white/[0.06] transition-colors"
                        >
                          <span className="text-sm text-white/80">👤 {r.label}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-white/70 mb-2">Message</label>
              <textarea
                {...register("message", { required: true, maxLength: 480 })}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all resize-none"
                placeholder="Type your message here..."
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-white/35">
                  Est. SMS Count: {smsCount}
                </span>
                <span className={`text-xs ${charCount > 480 ? "text-red-400" : "text-white/35"}`}>
                  {charCount} / {MAX_CHARS} characters
                </span>
              </div>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={selectedRecipients.length === 0 || !messageValue.trim() || isSending}
              className={`
                w-full py-3.5 rounded-xl font-medium text-sm text-white
                transition-all duration-300 flex items-center justify-center gap-2
                ${sent
                  ? "bg-emerald-500/80 border border-emerald-500/50"
                  : "bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:shadow-glow-purple"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <Check className="w-4 h-4" />
                  Sent Successfully!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send SMS
                </>
              )}
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
