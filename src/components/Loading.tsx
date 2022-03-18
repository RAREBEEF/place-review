import styles from "./Loading.module.scss";

const Loading: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>◌</div>
    </div>
  );
};

export default Loading;
