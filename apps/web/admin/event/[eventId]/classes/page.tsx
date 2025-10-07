"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Class = {
  id: string;
  name: string;
  type: string;
  value: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ClassesPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("distance");
  const [formValue, setFormValue] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    loadClasses();
  }, [eventId]);

  async function loadClasses() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${eventId}/class`);
      if (!res.ok) {
        throw new Error("Failed to load classes");
      }
      const data = await res.json();
      setClasses(data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error loading classes");
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingClass(null);
    setFormName("");
    setFormType("distance");
    setFormValue("");
    setFormDescription("");
    setShowForm(true);
  }

  function openEditForm(cls: Class) {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormType(cls.type);
    setFormValue(cls.value?.toString() || "");
    setFormDescription(cls.description || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      name: formName,
      type: formType,
      value: formValue ? parseInt(formValue) : null,
      description: formDescription || null,
    };

    try {
      if (editingClass) {
        // Update existing class
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${eventId}/class/${editingClass.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update class");
      } else {
        // Create new class
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${eventId}/class`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create class");
      }
      
      setShowForm(false);
      loadClasses();
    } catch (e: any) {
      alert(e.message || "Error saving class");
    }
  }

  async function handleDelete(classId: string) {
    if (!confirm("Är du säker på att du vill ta bort denna klass?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${eventId}/class/${classId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete class");
      loadClasses();
    } catch (e: any) {
      alert(e.message || "Error deleting class");
    }
  }

  function getTypeLabel(type: string) {
    switch(type) {
      case "distance": return "Distans";
      case "laps": return "Varv";
      case "time": return "Tid";
      default: return "Annat";
    }
  }

  function getValueLabel(type: string, value: number | null) {
    if (!value) return "-";
    switch(type) {
      case "distance": return `${value} meter`;
      case "laps": return `${value} varv`;
      case "time": return `${value} sekunder`;
      default: return value.toString();
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bold text-2xl mb-2">Tävlingsklasser</h1>
        <p className="text-gray-600 text-sm">Event ID: {eventId}</p>
        <a href="/admin/panel" className="text-blue-600 underline text-sm">← Tillbaka till adminpanel</a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button 
        onClick={openAddForm}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        + Lägg till ny klass
      </button>

      {showForm && (
        <div className="bg-gray-50 border border-gray-300 p-6 rounded mb-6">
          <h2 className="font-bold text-xl mb-4">
            {editingClass ? "Redigera klass" : "Lägg till ny klass"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Namn *</label>
              <input
                type="text"
                className="border p-2 w-full"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="t.ex. M21, K40, 10km"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Typ *</label>
              <select
                className="border p-2 w-full"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                required
              >
                <option value="distance">Distans (meter)</option>
                <option value="laps">Varv (antal)</option>
                <option value="time">Tid (sekunder)</option>
                <option value="other">Annat</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Värde ({formType === "distance" ? "meter" : formType === "laps" ? "antal varv" : formType === "time" ? "sekunder" : "nummer"})
              </label>
              <input
                type="number"
                className="border p-2 w-full"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Valfritt"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Beskrivning</label>
              <textarea
                className="border p-2 w-full"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Valfri beskrivning av klassen"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingClass ? "Uppdatera" : "Skapa"}
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Laddar...</p>
      ) : classes.length === 0 ? (
        <p className="text-gray-500">Inga klasser har lagts till än.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-b">Namn</th>
                <th className="px-4 py-2 text-left border-b">Typ</th>
                <th className="px-4 py-2 text-left border-b">Värde</th>
                <th className="px-4 py-2 text-left border-b">Beskrivning</th>
                <th className="px-4 py-2 text-left border-b">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{cls.name}</td>
                  <td className="px-4 py-2 border-b">{getTypeLabel(cls.type)}</td>
                  <td className="px-4 py-2 border-b">{getValueLabel(cls.type, cls.value)}</td>
                  <td className="px-4 py-2 border-b">{cls.description || "-"}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => openEditForm(cls)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2 text-sm"
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Ta bort
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
