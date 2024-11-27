import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function NoteDialog({ note }) {
  // <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  return (
    <Dialog>
      <Button asChild variant="outline" className="text-xs px-4 py-2">
        <DialogTrigger>
          Megtekintés
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">{note.title}</DialogTitle>
          <DialogDescription>
            <div dangerouslySetInnerHTML={{ __html: note.editor_html }} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
