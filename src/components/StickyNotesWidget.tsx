
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit2 } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";

const colors = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
];

export const StickyNotesWidget = () => {
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { stickyNotes, createStickyNote, updateStickyNote, deleteStickyNote } = useTaskStore();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await createStickyNote({
      content: newNote,
      color: selectedColor,
      position_x: 0,
      position_y: 0,
    });

    setNewNote("");
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    await updateStickyNote(editingId, { content: editContent });
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (id: string) => {
    await deleteStickyNote(id);
  };

  const getColorClasses = (colorName: string) => {
    const color = colors.find(c => c.name === colorName) || colors[0];
    return color;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📝</span>
          Quick Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a quick note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-6 h-6 rounded-full border-2 ${color.bg} ${
                    selectedColor === color.name ? 'border-gray-400' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <Button 
              onClick={handleAddNote} 
              size="sm" 
              disabled={!newNote.trim()}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>

        {/* Display notes */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stickyNotes.map((note) => {
            const colorClasses = getColorClasses(note.color || 'yellow');
            return (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-2 ${colorClasses.bg} ${colorClasses.border} relative group`}
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] bg-white/50 resize-none"
                    />
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit}
                        className="h-6 px-2 text-xs"
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="h-6 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm ${colorClasses.text} whitespace-pre-wrap`}>
                      {note.content}
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(note.id, note.content)}
                        className="h-6 w-6 p-0 hover:bg-white/50"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(note.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          
          {stickyNotes.length === 0 && (
            <div className="text-center text-gray-500 py-6">
              <span className="text-2xl">📝</span>
              <p className="text-sm mt-2">No notes yet. Add your first note above!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
