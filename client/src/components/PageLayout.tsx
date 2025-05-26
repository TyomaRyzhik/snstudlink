import styles from '../pages/Home/Home.module.css'
import RecentPostsSidebar from './RecentPostsSidebar'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
}

const PageLayout = ({ title, children }: PageLayoutProps) => (
  <div className={styles.container}>
    <main className={styles.feed}>
      <div className={styles.feedHeader}>{title}</div>
      {children}
    </main>
    <aside className={styles.widgets}>
      <RecentPostsSidebar />
    </aside>
  </div>
)

export default PageLayout 