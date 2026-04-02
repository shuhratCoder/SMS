"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { CalendarDays, ChevronDown, Send, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

interface SendSmsForm {
  message: string;
}

const MAX_CHARS = 160;

export default function SendSmsPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SendSmsForm>();

  const [groups, setGroups] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // 🔥 DATA LOAD
  useEffect(() => {
    api.getGroups().then(setGroups);
    api.getContacts().then(setContacts);
  }, []);

  const messageValue = watch("message") || "";
  const charCount = messageValue.length;
  const smsCount = Math.ceil(charCount / MAX_CHARS) || 0;

  // 🔥 REAL DATA
  const allRecipients = [
    ...groups.map((g) => ({
      id: `group-${g.id}`,
      label: `📁 ${g.groupName}`,
      count: g.Contacts?.length || 0,
    })),
    ...contacts.map((c) => ({
      id: `contact-${c.id}`,
      label: `${c.fullName}`,
      count: 1,
    })),
  ];

  const selected = allRecipients.find((r) => r.id === selectedRecipient);

  // 🔥 REAL SEND
  const onSubmit = async (data: SendSmsForm) => {
    try {
      setIsSending(true);

      let contactIds: string[] = [];
      let groupIds: string[] = [];

      if (selectedRecipient.startsWith("group-")) {
        groupIds.push(selectedRecipient.replace("group-", ""));
      } else {
        contactIds.push(selectedRecipient.replace("contact-", ""));
      }

      await api.sendSMS({
        message: data.message,
        contactIds,
        groupIds,
      });

      setIsSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);

    } catch (error) {
      console.error(error);
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.h1 className="text-2xl font-bold text-white font-display">
        Send SMS
      </motion.h1>

      <GlassCard className="max-w-3xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Send SMS</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* SELECT */}
            <div>
              <label className="text-sm text-white/70">Select recipient</label>

              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-left"
              >
                {selected ? selected.label : "Select group or contact"}
              </button>

              {showDropdown && (
                <div className="mt-2 bg-black rounded-xl p-2">

                  <div className="text-xs text-white/40 px-2">Groups</div>
                  {allRecipients.filter(r => r.id.startsWith("group")).map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecipient(r.id);
                        setShowDropdown(false);
                      }}
                      className="p-2 cursor-pointer hover:bg-white/10"
                    >
                      {r.label} ({r.count})
                    </div>
                  ))}

                  <div className="text-xs text-white/40 px-2 mt-2">Contacts</div>
                  {allRecipients.filter(r => r.id.startsWith("contact")).map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecipient(r.id);
                        setShowDropdown(false);
                      }}
                      className="p-2 cursor-pointer hover:bg-white/10"
                    >
                      {r.label}
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* MESSAGE */}
            <div>
              <textarea
                {...register("message", { required: true })}
                className="w-full p-3 rounded-xl bg-white/5 text-white"
                placeholder="Message..."
              />
              <div className="text-xs text-white/40">
                {charCount} / {MAX_CHARS}
              </div>
            </div>

            {/* SEND */}
            <button
              disabled={!selectedRecipient || isSending}
              className="w-full py-3 bg-purple-600 rounded-xl text-white"
            >
              {isSending ? "Sending..." : sent ? "Sent ✅" : "Send SMS"}
            </button>

          </form>
        </div>
      </GlassCard>
    </div>
  );
}