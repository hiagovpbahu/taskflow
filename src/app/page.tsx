import { Sidebar } from '~/components/sidebar'
import { TaskTable } from '~/components/task-table/task-table'

export default function Home() {
  return (
    <div className='bg-background'>
      <Sidebar />
      <main className='lg:pl-72'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <TaskTable />
        </div>
      </main>
    </div>
  )
}
