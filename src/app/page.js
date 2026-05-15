import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, {session?.user?.name} 👋
      </h1>
      <p className="text-gray-500 mt-1">What would you like to do today?</p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href="/pharmacy" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">💊</div>
          <h2 className="font-semibold text-lg">Pharmacy</h2>
          <p className="text-gray-500 text-sm mt-1">Manage sales, inventory, and stock</p>
        </a>
        <a href="/dental" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🦷</div>
          <h2 className="font-semibold text-lg">Dental Clinic</h2>
          <p className="text-gray-500 text-sm mt-1">Manage patients and treatments</p>
        </a>
      </div>
    </div>
  )
}