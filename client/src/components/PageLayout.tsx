import styles from '../pages/Home/Home.module.css'
import RecentPostsSidebar from './RecentPostsSidebar'
import React from 'react'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode | React.ReactNode[]
}

const PageLayout = ({ title, children, actions }: PageLayoutProps) => (
  <div className={styles.container}>
    <main className={styles.feed}>
      <div className={styles.feedHeader}>
        <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{title}</span>
        <div className={styles.headerActions}>
          {actions}
        </div>
      </div>
      {children}
    </main>
    <aside className={styles.widgets}>
      <RecentPostsSidebar />
    </aside>
  </div>
)

export default PageLayout 