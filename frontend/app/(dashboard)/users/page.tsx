async function getUsers() {
  try {
    // We fetch directly from the backend's address.
    // In a real production app, this would be an environment variable.
    const res = await fetch('http://127.0.0.1:8000/api/users/', {
      cache: 'no-store', // This ensures we always get the latest data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await res.json();
    return users;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return []; // Return an empty array on error
  }
}

export default async function UsersPage() {
  const users: { id: number; username: string; email: string }[] = await getUsers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">User List from Django API</h1>
      <div className="bg-black p-4 rounded-lg shadow-sm">
        <ul className="divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id} className="py-3 flex justify-between items-center">
                <span className="font-medium">{user.username}</span>
                <span className="text-gray-500">{user.email}</span>
              </li>
            ))
          ) : (
            <p>No users found or failed to load data.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
