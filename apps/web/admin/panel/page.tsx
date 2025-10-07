export default function Panel() {
  return (
    <main className="p-8">
      <h1 className="font-bold text-2xl">Adminpanel</h1>
      <ul className="list-disc pl-6 mt-4">
        <li><a href="/admin/import" className="text-blue-600 underline">Importera deltagare</a></li>
        <li><a href="/admin/events" className="text-blue-600 underline">Hantera event</a></li>
      </ul>
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-bold mb-2">Hantera tävlingsklasser</h2>
        <p className="text-sm text-gray-700">
          För att hantera tävlingsklasser (Classes) för ett event, gå till:<br/>
          <code className="bg-gray-200 px-2 py-1 rounded text-xs">
            /admin/event/[eventId]/classes
          </code>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Ersätt <code className="bg-gray-200 px-1">[eventId]</code> med ditt event-ID.
        </p>
      </div>
    </main>
  );
}