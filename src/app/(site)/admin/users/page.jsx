
import UserTable from '@/components/ui/admin/UserTable';

export default function ManageUsers() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <UserTable />
    </div>
  );
}
