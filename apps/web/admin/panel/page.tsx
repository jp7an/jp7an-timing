export default function Panel() {
  return (
    <main className="p-8">
      <h1 className="font-bold text-2xl">Adminpanel</h1>
      <ul className="list-disc pl-6 mt-4">
        <li><a href="/admin/import" className="text-blue-600 underline">Importera deltagare</a></li>
        <li><a href="/admin/events" className="text-blue-600 underline">Hantera event</a></li>
      </ul>
    </main>
  );
}