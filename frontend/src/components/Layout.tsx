import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'
import ContactsModal from './ContactsModal'

// Persistent application shell: page content + bottom tab bar + global modals.
export default function Layout() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <TabBar />
      <ContactsModal />
    </div>
  )
}
