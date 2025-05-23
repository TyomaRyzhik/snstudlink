import styles from '../pages/Home/Home.module.css'

const Trends = () => (
  <div className={styles.trends}>
    <input className={styles.trendsSearch} placeholder="Search" />
    <div className={styles.trendBlock}>
      <div className={styles.trendTitle}>Trends for you</div>
      <div style={{marginBottom: 16}}>
        <b>#BreakingNews</b>
        <div style={{color: '#8899a6', fontSize: 13}}>10,094 people are Tweeting about this</div>
      </div>
      <div style={{marginBottom: 16}}>
        <b>#WorldNews</b>
        <div style={{color: '#8899a6', fontSize: 13}}>125K Tweets</div>
      </div>
      <div style={{marginBottom: 16}}>
        <b>#GreatestOfAllTime</b>
        <div style={{color: '#8899a6', fontSize: 13}}>100K Tweets</div>
      </div>
      <div style={{color: '#1da1f2', cursor: 'pointer'}}>Show more</div>
    </div>
  </div>
)

export default Trends 