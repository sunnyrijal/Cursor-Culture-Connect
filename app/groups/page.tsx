import { useState, useEffect } from 'react';
import { ApiGroup } from '@/types/group';

export default function GroupsPage() {
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        setName('');
        fetchGroups(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div>
      <h1>Groups</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          required
        />
        <button type="submit">Create Group</button>
      </form>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
}
