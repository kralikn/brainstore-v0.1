import { Eye, SquarePen } from "lucide-react";
import { Button } from "../ui/button";
import NoteDialog from "./dialog";

export default function ChatNoteItem({ note }) {

  console.log(note);

  return (
    <div className="flex justify-between items-start gap-2">
      <div className="flex gap-3 items-center">
        <SquarePen size={18} />
        <div className="">{note.title}</div>
      </div>
      <NoteDialog note={note} />
    </div>
  )
}
