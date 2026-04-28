"use client";

import { useRef, useState } from "react";

interface PendingMentee {
  id: string;
  name: string;
  reason: "unassigned" | "mentor_unavailable";
  currentMentorName: string | null;
}

interface MentorCard {
  id: string;
  name: string;
  load: number;
  mentees: Array<{ id: string; name: string; email: string }>;
}

interface UnavailableMentorCard {
  id: string;
  name: string;
  affectedCount: number;
}

interface AssignmentBoardProps {
  pendingMentees: PendingMentee[];
  mentorCards: MentorCard[];
  unavailableMentorCards: UnavailableMentorCard[];
  onAssign: (formData: FormData) => Promise<void>;
}

export function AssignmentBoard({
  pendingMentees,
  mentorCards,
  unavailableMentorCards,
  onAssign,
}: AssignmentBoardProps) {
  const [draggingMenteeId, setDraggingMenteeId] = useState<string | null>(null);
  const [dropTargetMentorId, setDropTargetMentorId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menteeInputRef = useRef<HTMLInputElement>(null);
  const mentorInputRef = useRef<HTMLInputElement>(null);

  const menteesById = new Map<string, { id: string; name: string; email: string }>();
  pendingMentees.forEach((mentee) => {
    menteesById.set(mentee.id, { id: mentee.id, name: mentee.name, email: "" });
  });
  mentorCards.forEach((mentor) => {
    mentor.mentees.forEach((mentee) => {
      menteesById.set(mentee.id, mentee);
    });
  });

  function submitDrop(menteeId: string, mentorId: string) {
    if (!menteeInputRef.current || !mentorInputRef.current || !formRef.current) {
      return;
    }

    menteeInputRef.current.value = menteeId;
    mentorInputRef.current.value = mentorId;
    formRef.current.requestSubmit();
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={onAssign} className="hidden">
        <input ref={mentorInputRef} type="hidden" name="mentorId" />
        <input ref={menteeInputRef} type="hidden" name="menteeId" />
      </form>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mentorCards.map((mentor) => (
            <div
              key={mentor.id}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTargetMentorId(mentor.id);
              }}
              onDragLeave={() => setDropTargetMentorId(null)}
              onDrop={(event) => {
                event.preventDefault();
                setDropTargetMentorId(null);
                if (!draggingMenteeId) {
                  return;
                }

                submitDrop(draggingMenteeId, mentor.id);
              }}
              className={`rounded-lg border bg-white p-3 transition ${
                dropTargetMentorId === mentor.id
                  ? "border-emerald-400 ring-2 ring-emerald-200"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{mentor.name}</h3>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{mentor.load}</span>
              </div>

              <div className="mt-3 space-y-2">
                {mentor.mentees.length === 0 ? (
                  <p className="rounded border border-dashed border-slate-300 px-2 py-2 text-xs text-slate-500">Drop mentees here</p>
                ) : (
                  mentor.mentees.map((mentee) => (
                    <div
                      key={mentee.id}
                      draggable
                      onDragStart={() => setDraggingMenteeId(mentee.id)}
                      onDragEnd={() => {
                        setDraggingMenteeId(null);
                        setDropTargetMentorId(null);
                      }}
                      className="cursor-move rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-slate-900">{mentee.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-800">Unavailable Mentors (Locked)</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {unavailableMentorCards.length === 0 ? (
              <p className="text-xs text-slate-500">No unavailable mentors in this cycle.</p>
            ) : (
              unavailableMentorCards.map((mentor) => (
                <div key={mentor.id} className="rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-700">
                  <p className="font-medium">{mentor.name}</p>
                  <p className="mt-1">Affected mentees: {mentor.affectedCount}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <h2 className="text-sm font-semibold text-amber-900">Pending Mentees</h2>
          <p className="mt-1 text-xs text-amber-800">Drag any mentee into an available mentor card.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {pendingMentees.length === 0 ? (
              <p className="rounded border border-amber-200 bg-white px-3 py-2 text-xs text-amber-700">No pending mentees.</p>
            ) : (
              pendingMentees.map((mentee) => (
                <div
                  key={mentee.id}
                  draggable
                  onDragStart={() => setDraggingMenteeId(mentee.id)}
                  onDragEnd={() => {
                    setDraggingMenteeId(null);
                    setDropTargetMentorId(null);
                  }}
                  className="cursor-move rounded border border-amber-200 bg-white px-3 py-2 text-xs shadow-sm"
                >
                  <p className="font-medium text-slate-900">{mentee.name}</p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    {mentee.reason === "unassigned"
                      ? "Unassigned"
                      : `Mentor unavailable${mentee.currentMentorName ? `: ${mentee.currentMentorName}` : ""}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
